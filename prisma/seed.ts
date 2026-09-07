import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import { ROLE_ADMIN, ROLE_USER, PLATFORM_SETTING_KEYS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  const [adminRole, userRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: ROLE_ADMIN },
      update: {},
      create: { name: ROLE_ADMIN, description: "Full administrative access to the platform." },
    }),
    prisma.role.upsert({
      where: { name: ROLE_USER },
      update: {},
      create: { name: ROLE_USER, description: "Standard investor (demo) account." },
    }),
  ]);

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Platform Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
      portfolio: {
        create: { cashBalance: 0, totalDeposited: 0 },
      },
    },
  });
  console.log(`Admin user ready: ${admin.email} (password from SEED_ADMIN_PASSWORD env var)`);

  const demoInvestorPasswordHash = await bcrypt.hash("Demo1234!", 12);
  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo Investor",
      email: "demo@example.com",
      passwordHash: demoInvestorPasswordHash,
      roleId: userRole.id,
      portfolio: {
        create: { cashBalance: 10000, totalDeposited: 10000 },
      },
      notifications: {
        create: {
          type: "INFO",
          title: "Sample account",
          message: "This is a seeded demo account. Balances are simulated.",
        },
      },
    },
  });
  console.log("Demo investor ready: demo@example.com / Demo1234!");

  const plans = [
    {
      name: "Starter Plan",
      slug: "starter-plan",
      description:
        "A low-risk entry plan for exploring the simulation. Steady, modest simulated returns over a short term.",
      minAmount: 100,
      maxAmount: 5000,
      returnRateBps: 400,
      durationDays: 30,
      riskLevel: "LOW" as const,
    },
    {
      name: "Growth Plan",
      slug: "growth-plan",
      description:
        "A balanced plan aimed at moderate simulated growth over a medium term with medium simulated risk.",
      minAmount: 500,
      maxAmount: 25000,
      returnRateBps: 900,
      durationDays: 90,
      riskLevel: "MEDIUM" as const,
    },
    {
      name: "Premium Plan",
      slug: "premium-plan",
      description:
        "A higher simulated-return, higher simulated-risk plan for long-term demo scenarios.",
      minAmount: 2000,
      maxAmount: null,
      returnRateBps: 1600,
      durationDays: 180,
      riskLevel: "HIGH" as const,
    },
  ];

  for (const plan of plans) {
    await prisma.investmentPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    });
  }
  console.log(`Seeded ${plans.length} investment plans.`);

  const assets = [
    { symbol: "ABC", name: "ABC Corporation", type: "STOCK" as const, price: 128.42 },
    { symbol: "TNV", name: "TechNova Inc.", type: "STOCK" as const, price: 84.15 },
    { symbol: "GLDX", name: "GoldX Commodity Index", type: "COMMODITY" as const, price: 2312.6 },
    { symbol: "SIMCOIN", name: "SimCoin", type: "CRYPTO" as const, price: 41250.33 },
    { symbol: "GIDX", name: "Global Demo Index", type: "INDEX" as const, price: 4521.88 },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { symbol: asset.symbol },
      update: {},
      create: { ...asset, previousPrice: asset.price },
    });
  }
  console.log(`Seeded ${assets.length} simulated assets.`);

  const abc = await prisma.asset.findUnique({ where: { symbol: "ABC" } });
  const simcoin = await prisma.asset.findUnique({ where: { symbol: "SIMCOIN" } });

  await prisma.marketEvent.createMany({
    data: [
      {
        category: "RATE_CHANGE",
        headline: "Simulated platform interest rate increased to 4.2%",
        description: "The base simulated rate used for new Starter Plan subscriptions was adjusted by the admin team.",
      },
      {
        category: "PRICE_MOVE",
        headline: "ABC shares increased 4.2% in simulated trading",
        description: "Demo price movement generated for platform activity — not a real market quote.",
        assetId: abc?.id,
      },
      {
        category: "PRICE_MOVE",
        headline: "SimCoin simulated price up 2.1% on the day",
        description: "Demo price movement generated for platform activity — not a real market quote.",
        assetId: simcoin?.id,
      },
      {
        category: "PLATFORM_NEWS",
        headline: "New Growth Plan simulation now available",
        description: "Admins added a new demo investment plan with a 90-day simulated term.",
      },
      {
        category: "ACCOUNT_ACTIVITY",
        headline: "User account activity: new demo signups this week",
        description: "Aggregate simulated platform activity summary.",
      },
    ],
  });
  console.log("Seeded market events.");

  await prisma.platformSetting.upsert({
    where: { key: PLATFORM_SETTING_KEYS.SITE_NAME },
    update: {},
    create: { key: PLATFORM_SETTING_KEYS.SITE_NAME, value: "Vantage Sim", description: "Public site name." },
  });
  await prisma.platformSetting.upsert({
    where: { key: PLATFORM_SETTING_KEYS.DEPOSIT_INSTRUCTIONS },
    update: {},
    create: {
      key: PLATFORM_SETTING_KEYS.DEPOSIT_INSTRUCTIONS,
      value:
        "This is a DEMO deposit flow. No real payment is processed. In a production deployment, real payment/deposit instructions would be configured here by an administrator.",
      description: "Shown on the user Deposit page.",
    },
  });
  await prisma.platformSetting.upsert({
    where: { key: PLATFORM_SETTING_KEYS.DEPOSIT_REFERENCE_PREFIX },
    update: {},
    create: {
      key: PLATFORM_SETTING_KEYS.DEPOSIT_REFERENCE_PREFIX,
      value: "DEMO-DEP",
      description: "Prefix used when generating demo deposit reference codes.",
    },
  });
  await prisma.platformSetting.upsert({
    where: { key: PLATFORM_SETTING_KEYS.SUPPORT_EMAIL },
    update: {},
    create: {
      key: PLATFORM_SETTING_KEYS.SUPPORT_EMAIL,
      value: "support@example.com",
      description: "Contact email shown in the footer.",
    },
  });
  console.log("Seeded platform settings.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
