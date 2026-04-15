import { I18nKey } from "../../constants/i18n-key";
import { HttpStatus } from "../../constants/http-status";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";

/**
 * Read-only organization queries scoped by tenant id.
 */
export class OrganizationsService {
  /**
   * Loads the active organization row for the authenticated tenant.
   *
   * @param organizationId Organization id from JWT.
   * @returns Public organization fields.
   */
  async getCurrentOrganization(organizationId: string): Promise<{
    id: string;
    name: string;
    slug: string;
  }> {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        deletedAt: null
      }
    });
    if (!organization) {
      throw new ApiError(HttpStatus.NotFound, I18nKey.Errors.Organization.NotFound);
    }

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug
    };
  }
}
