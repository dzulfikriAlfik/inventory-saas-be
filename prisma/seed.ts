/**
 * Development seed for the Inventory SaaS MVP schema.
 * Clears existing rows (dev-only) then inserts one demo tenant with users, master data, and sample DRAFT documents.
 *
 * Run: `npm run db:seed` (uses `.env.development` via dotenv-cli).
 */
import { PrismaClient, Prisma, PurchaseReceiptStatus, Role, SalesShipmentStatus, StockAdjustmentStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

/** Shared demo password (min 8 chars; matches auth validation). */
const DEMO_PASSWORD = "Demo1234!";

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

async function clearAll(): Promise<void> {
  await prisma.stockAdjustmentItem.deleteMany();
  await prisma.stockAdjustment.deleteMany();
  await prisma.salesShipmentItem.deleteMany();
  await prisma.salesShipment.deleteMany();
  await prisma.purchaseReceiptItem.deleteMany();
  await prisma.purchaseReceipt.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.session.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
}

async function main(): Promise<void> {
  console.info("Seeding MVP demo data…");

  await clearAll();

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const org = await prisma.organization.create({
    data: {
      name: "Acme Demo",
      slug: "acme-demo"
    }
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@acme-demo.local",
      fullName: "Demo Owner",
      passwordHash
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@acme-demo.local",
      fullName: "Demo Admin",
      passwordHash
    }
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@acme-demo.local",
      fullName: "Demo Staff",
      passwordHash
    }
  });

  await prisma.membership.createMany({
    data: [
      { userId: owner.id, organizationId: org.id, role: Role.OWNER },
      { userId: admin.id, organizationId: org.id, role: Role.ADMIN },
      { userId: staff.id, organizationId: org.id, role: Role.STAFF }
    ]
  });

  const [whMain, whSecondary] = await prisma.$transaction([
    prisma.warehouse.create({
      data: {
        organizationId: org.id,
        code: "WH-MAIN",
        name: "Main warehouse"
      }
    }),
    prisma.warehouse.create({
      data: {
        organizationId: org.id,
        code: "WH-SECONDARY",
        name: "Secondary warehouse"
      }
    })
  ]);

  const [productA, productB] = await prisma.$transaction([
    prisma.product.create({
      data: {
        organizationId: org.id,
        sku: "SKU-001",
        name: "Widget A",
        unit: "pcs"
      }
    }),
    prisma.product.create({
      data: {
        organizationId: org.id,
        sku: "SKU-002",
        name: "Widget B",
        unit: "box"
      }
    })
  ]);

  await prisma.$transaction([
    prisma.supplier.create({
      data: {
        organizationId: org.id,
        code: "SUP-001",
        name: "Supplier Utama"
      }
    }),
    prisma.supplier.create({
      data: {
        organizationId: org.id,
        code: "SUP-002",
        name: "Supplier Cadangan"
      }
    }),
    prisma.customer.create({
      data: {
        organizationId: org.id,
        code: "CUST-001",
        name: "Customer Retail"
      }
    }),
    prisma.customer.create({
      data: {
        organizationId: org.id,
        code: "CUST-002",
        name: "Customer Grosir"
      }
    })
  ]);

  const suppliers = await prisma.supplier.findMany({ where: { organizationId: org.id } });
  const customers = await prisma.customer.findMany({ where: { organizationId: org.id } });
  const supplierMain = suppliers.find((s) => s.code === "SUP-001")!;
  const customerMain = customers.find((c) => c.code === "CUST-001")!;

  const qty = (n: string) => new Prisma.Decimal(n);

  await prisma.stock.createMany({
    data: [
      {
        organizationId: org.id,
        productId: productA.id,
        warehouseId: whMain.id,
        quantity: qty("100")
      },
      {
        organizationId: org.id,
        productId: productA.id,
        warehouseId: whSecondary.id,
        quantity: qty("25")
      },
      {
        organizationId: org.id,
        productId: productB.id,
        warehouseId: whMain.id,
        quantity: qty("40")
      }
    ]
  });

  const pr = await prisma.purchaseReceipt.create({
    data: {
      organizationId: org.id,
      receiptNumber: "PR-0001",
      status: PurchaseReceiptStatus.DRAFT,
      supplierId: supplierMain.id,
      note: "Seed: incoming stock (draft)",
      createdByUserId: owner.id
    }
  });

  await prisma.purchaseReceiptItem.create({
    data: {
      organizationId: org.id,
      purchaseReceiptId: pr.id,
      productId: productB.id,
      warehouseId: whMain.id,
      quantity: qty("10")
    }
  });

  const ss = await prisma.salesShipment.create({
    data: {
      organizationId: org.id,
      shipmentNumber: "SS-0001",
      status: SalesShipmentStatus.DRAFT,
      customerId: customerMain.id,
      note: "Seed: outbound (draft)",
      createdByUserId: owner.id
    }
  });

  await prisma.salesShipmentItem.create({
    data: {
      organizationId: org.id,
      salesShipmentId: ss.id,
      productId: productA.id,
      warehouseId: whMain.id,
      quantity: qty("5")
    }
  });

  const sa = await prisma.stockAdjustment.create({
    data: {
      organizationId: org.id,
      adjustmentNumber: "SA-0001",
      status: StockAdjustmentStatus.DRAFT,
      note: "Seed: stock correction (draft)",
      createdByUserId: admin.id
    }
  });

  await prisma.stockAdjustmentItem.create({
    data: {
      organizationId: org.id,
      stockAdjustmentId: sa.id,
      productId: productA.id,
      warehouseId: whSecondary.id,
      quantity: qty("-2")
    }
  });

  console.info("Done. Demo tenant:", org.slug);
  console.info("  Login (any user): password =", DEMO_PASSWORD);
  console.info("  owner@acme-demo.local  (OWNER)");
  console.info("  admin@acme-demo.local  (ADMIN)");
  console.info("  staff@acme-demo.local  (STAFF)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
