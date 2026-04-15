import { Role } from "@prisma/client";
import { I18nKey } from "../../constants/i18n-key";
import { HttpStatus } from "../../constants/http-status";
import { SlugSeparator, TextPattern } from "../../constants/text";
import { TimeMs } from "../../constants/time-ms";
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt";
import { prisma } from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../lib/password";
import { ApiError } from "../../utils/api-error";
import type { LoginInput, RegisterInput } from "./auth.schema";

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Issues access and refresh JWTs for a membership context.
 *
 * @param payload - Claims embedded in both tokens.
 * @param payload.userId - User row id.
 * @param payload.organizationId - Tenant (organization) id.
 * @param payload.role - Membership role for this tenant.
 * @returns Object with `accessToken` (short TTL) and `refreshToken` (long TTL), both serialized JWT strings.
 */
const issueTokens = (payload: {
  userId: string;
  organizationId: string;
  role: Role;
}): SessionTokens => {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
};

/**
 * Authentication and session orchestration (register, login, refresh, logout, me).
 */
export class AuthService {
  /**
   * Registers a new user, organization (tenant), and OWNER membership in one transaction, then creates a session row.
   *
   * @param input - Registration fields (see `registerSchema` in `auth.schema.ts`).
   * @param input.email - Unique email; conflict returns `409`.
   * @param input.password - Plaintext password; hashed before persistence.
   * @param input.fullName - User display name.
   * @param input.organizationName - Tenant name; slug derived via lowercase and whitespace replacement.
   * @returns `accessToken` and `refreshToken` strings; caller typically sets HttpOnly cookies.
   * @throws {ApiError} Email already registered (`409`).
   */
  async register(input: RegisterInput): Promise<SessionTokens> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email }
    });
    if (existingUser) {
      throw new ApiError(HttpStatus.Conflict, I18nKey.Errors.Auth.EmailAlreadyRegistered);
    }

    const passwordHash = await hashPassword(input.password);

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: input.organizationName,
          slug: input.organizationName.toLowerCase().replace(TextPattern.WhitespaceRuns, SlugSeparator)
        }
      });

      const user = await tx.user.create({
        data: {
          email: input.email,
          fullName: input.fullName,
          passwordHash
        }
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: Role.OWNER
        }
      });

      return {
        userId: user.id,
        organizationId: organization.id,
        role: membership.role
      };
    });

    const tokens = issueTokens(result);

    await prisma.session.create({
      data: {
        userId: result.userId,
        organizationId: result.organizationId,
        refreshTokenHash: hashRefreshToken(tokens.refreshToken),
        expiresAt: new Date(Date.now() + TimeMs.OneWeek)
      }
    });

    return tokens;
  }

  /**
   * Validates credentials and creates a new refresh session row linked to the user’s active membership.
   *
   * @param input - Login fields (`loginSchema`).
   * @param input.email - Account email.
   * @param input.password - Plaintext password to verify against `user.passwordHash`.
   * @returns New `accessToken` and `refreshToken` strings.
   * @throws {ApiError} Invalid credentials (`401`), or no active membership (`403`).
   */
  async login(input: LoginInput): Promise<SessionTokens> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        memberships: {
          include: {
            organization: true
          }
        }
      }
    });
    if (!user || user.deletedAt) {
      throw new ApiError(HttpStatus.Unauthorized, I18nKey.Errors.Auth.InvalidCredentials);
    }

    const passwordValid = await verifyPassword(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new ApiError(HttpStatus.Unauthorized, I18nKey.Errors.Auth.InvalidCredentials);
    }

    const membership = user.memberships.find((item) => !item.deletedAt);
    if (!membership) {
      throw new ApiError(HttpStatus.Forbidden, I18nKey.Errors.Auth.NoActiveMembership);
    }

    const tokens = issueTokens({
      userId: user.id,
      organizationId: membership.organizationId,
      role: membership.role
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        organizationId: membership.organizationId,
        refreshTokenHash: hashRefreshToken(tokens.refreshToken),
        expiresAt: new Date(Date.now() + TimeMs.OneWeek)
      }
    });

    return tokens;
  }

  /**
   * Rotates refresh session: revokes the presented token and stores a new refresh hash.
   *
   * @param refreshToken - Raw refresh JWT from the client (cookie or body).
   * @returns New access and refresh tokens.
   * @throws {ApiError} When the session is missing, revoked, or expired (`401`).
   */
  async refresh(refreshToken: string): Promise<SessionTokens> {
    const payload = verifyRefreshToken(refreshToken);
    const hashed = hashRefreshToken(refreshToken);

    const session = await prisma.session.findFirst({
      where: {
        refreshTokenHash: hashed,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });
    if (!session) {
      throw new ApiError(HttpStatus.Unauthorized, I18nKey.Errors.Auth.InvalidRefreshSession);
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() }
    });

    const tokens = issueTokens({
      userId: payload.userId,
      organizationId: payload.organizationId,
      role: payload.role
    });

    await prisma.session.create({
      data: {
        userId: payload.userId,
        organizationId: payload.organizationId,
        refreshTokenHash: hashRefreshToken(tokens.refreshToken),
        expiresAt: new Date(Date.now() + TimeMs.OneWeek)
      }
    });

    return tokens;
  }

  /**
   * Revokes the session matching the refresh token hash, if present.
   *
   * @param refreshToken - Raw refresh JWT from the client.
   */
  async logout(refreshToken: string): Promise<void> {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    await prisma.session.updateMany({
      where: {
        refreshTokenHash,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  /**
   * Returns the authenticated user and organization for `/auth/me`.
   *
   * @param userId - Authenticated user id (from JWT).
   * @param organizationId - Active organization id (from JWT).
   * @returns Nested DTO:
   * - `user`: `id`, `email`, `fullName` (non-sensitive profile fields).
   * - `organization`: `id`, `name`, `slug` for the tenant.
   * @throws {ApiError} When membership is missing or soft-deleted entities are involved (`404`).
   */
  async me(userId: string, organizationId: string): Promise<{
    user: {
      id: string;
      email: string;
      fullName: string;
    };
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  }> {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
        deletedAt: null
      },
      include: {
        user: true,
        organization: true
      }
    });
    if (!membership || membership.user.deletedAt || membership.organization.deletedAt) {
      throw new ApiError(HttpStatus.NotFound, I18nKey.Errors.Membership.NotFound);
    }

    return {
      user: {
        id: membership.user.id,
        email: membership.user.email,
        fullName: membership.user.fullName
      },
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug
      }
    };
  }
}
