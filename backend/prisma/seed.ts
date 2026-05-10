import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding QuickApps database...');

  // 1. Create admin org
  const adminOrg = await prisma.organisation.upsert({
    where: { slug: 'techzunction-admin' },
    update: {},
    create: {
      name: 'TechZunction Admin',
      slug: 'techzunction-admin',
      plan: 'premium',
      billingEmail: 'admin@quickapps.in',
    },
  });
  console.log('✓ Admin org:', adminOrg.id);

  // 2. Create admin user
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email_orgId: { email: 'admin@quickapps.in', orgId: adminOrg.id } },
    update: {},
    create: {
      orgId: adminOrg.id,
      email: 'admin@quickapps.in',
      passwordHash,
      name: 'QuickApps Admin',
      role: 'owner',
      authProvider: 'email',
      emailVerified: true,
    },
  });
  console.log('✓ Admin user:', adminUser.id);

  // 3. Create admin wallet
  await prisma.mintWallet.upsert({
    where: { orgId: adminOrg.id },
    update: {},
    create: { orgId: adminOrg.id, balance: 0 },
  });
  console.log('✓ Admin wallet created');

  // 4. Create demo org
  const demoOrg = await prisma.organisation.upsert({
    where: { slug: 'ravi-stores-demo' },
    update: {},
    create: {
      name: 'Ravi Stores',
      slug: 'ravi-stores-demo',
      plan: 'pro',
      billingEmail: 'ravi@example.com',
    },
  });
  console.log('✓ Demo org:', demoOrg.id);

  // 5. Create demo user
  const demoHash = await bcrypt.hash('Demo@123', 12);
  const demoUser = await prisma.user.upsert({
    where: { email_orgId: { email: 'ravi@example.com', orgId: demoOrg.id } },
    update: {},
    create: {
      orgId: demoOrg.id,
      email: 'ravi@example.com',
      passwordHash: demoHash,
      name: 'Ravi Kumar',
      role: 'owner',
      authProvider: 'email',
      emailVerified: true,
    },
  });
  console.log('✓ Demo user:', demoUser.id);

  // 6. Create demo wallet
  await prisma.mintWallet.upsert({
    where: { orgId: demoOrg.id },
    update: {},
    create: { orgId: demoOrg.id, balance: 500000 }, // ₹5,000
  });
  console.log('✓ Demo wallet: ₹5,000');

  // 7. Create demo app
  const demoApp = await prisma.app.upsert({
    where: { orgId_bundleId: { orgId: demoOrg.id, bundleId: 'com.quickapps.ravistores' } },
    update: {},
    create: {
      orgId: demoOrg.id,
      name: 'Ravi Stores',
      bundleId: 'com.quickapps.ravistores',
      url: 'https://ravistores.com',
      shortDescription: 'Order groceries from Ravi Stores',
      status: 'configured',
      configJson: {
        identity: { appName: 'Ravi Stores', bundleId: 'com.quickapps.ravistores', url: 'https://ravistores.com' },
        branding: { themeColor: '#F97316', splashBgColor: '#FFFFFF', splashDuration: 2, splashAnimation: 'fade' },
        display: { orientation: 'portrait', statusBarStyle: 'dark', pullToRefresh: true, pinchToZoom: false, navigationProgressBar: true },
        links: { domainWhitelist: ['ravistores.com'], domainBlacklist: [], customUrlScheme: 'ravistores' },
        security: { sslEnforcement: true, disableScreenshots: false, clipboardControl: true, disableCaching: false },
        noInternet: { headingText: 'No Internet Connection', bodyText: 'Please check your connection and try again.', retryButtonLabel: 'Try Again', retryButtonColor: '#F97316' },
        advanced: { jsBridgeEnabled: true, appVersionName: '1.0.0', appVersionCode: 1 },
      },
    },
  });
  console.log('✓ Demo app:', demoApp.id);

  // 8. Create revision tracker for demo app
  await prisma.revision.upsert({
    where: { appId: demoApp.id },
    update: {},
    create: { appId: demoApp.id, freeLimit: 3, usedCount: 0 },
  });
  console.log('✓ Demo revision tracker');

  // 9. Create some purchased addons for demo app
  const demoAddons = ['onesignal-push', 'biometric-auth', 'whatsapp-bridge'];
  for (const slug of demoAddons) {
    await prisma.addonPurchase.upsert({
      where: { appId_addonSlug: { appId: demoApp.id, addonSlug: slug } },
      update: {},
      create: { orgId: demoOrg.id, appId: demoApp.id, addonSlug: slug, isActive: true },
    });
  }
  console.log('✓ Demo addons on Ravi Stores app: onesignal-push, biometric-auth, whatsapp-bridge');

  console.log('\n🎉 Seed complete!');
  console.log('\n📧 Login credentials:');
  console.log('   Admin:  admin@quickapps.in / Admin@123');
  console.log('   Demo:   ravi@example.com / Demo@123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
