import type { Role } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt";
import { hashPassword, verifyPassword } from "../../lib/password";
import { ApiError } from "../../utils/api-error";
import type { LoginInput, RegisterInput } from "./auth.schema";

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

const issueTokens = (payload: {
  userId: string;
  organizationId: string;
  role: Role;
}): SessionTokens => {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
};

export class AuthService {
  async register(input: RegisterInput): Promise<SessionTokens> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email }
    });
    if (existingUser) {
      throw new ApiError(409, "errors.auth.emailAlreadyRegistered");
    }

    const passwordHash = await hashPassword(input.password);

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: input.organizationName,
          slug: input.organizationName.toLowerCase().replace(/\s+/g, "-")
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
          role: "OWNER"
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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return tokens;
  }

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
      throw new ApiError(401, "errors.auth.invalidCredentials");
    }

    const passwordValid = await verifyPassword(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new ApiError(401, "errors.auth.invalidCredentials");
    }

    const membership = user.memberships.find((item) => !item.deletedAt);
    if (!membership) {
      throw new ApiError(403, "errors.auth.noActiveMembership");
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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return tokens;
  }

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
      throw new ApiError(401, "errors.auth.invalidRefreshSession");
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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return tokens;
  }

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
      throw new ApiError(404, "errors.membership.notFound");
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
