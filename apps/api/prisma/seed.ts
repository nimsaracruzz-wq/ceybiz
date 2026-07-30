import { PrismaClient, Role, PlanTier, ProductStatus, ConversationMode, MessageSender, MessageType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Plans
  const trialPlan = await prisma.plan.upsert({
    where: { name: PlanTier.TRIAL },
    update: {},
    create: {
      name: PlanTier.TRIAL,
      displayName: 'Trial Plan',
      description: '14-day free trial for small businesses',
      priceMonthly: 0,
      priceAnnual: 0,
      aiRepliesQuota: 200,
      whatsAppAccounts: 1,
      productLimit: 50,
      teamMembersLimit: 1,
      voiceAiAllowed: false,
      visionAiAllowed: false,
      campaignsAllowed: false,
      campaignQuota: 0,
      advancedAnalytics: false,
      apiAccessAllowed: false,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: PlanTier.PRO },
    update: {},
    create: {
      name: PlanTier.PRO,
      displayName: 'Pro Plan',
      description: 'Ideal for growing online stores and SMEs',
      priceMonthly: 49,
      priceAnnual: 470,
      aiRepliesQuota: 5000,
      whatsAppAccounts: 1,
      productLimit: 1000,
      teamMembersLimit: 3,
      voiceAiAllowed: true,
      visionAiAllowed: true,
      campaignsAllowed: true,
      campaignQuota: 1000,
      advancedAnalytics: false,
      apiAccessAllowed: false,
    },
  });

  const maxPlan = await prisma.plan.upsert({
    where: { name: PlanTier.MAX },
    update: {},
    create: {
      name: PlanTier.MAX,
      displayName: 'Max Plan',
      description: 'Unlimited capacity for high-volume sales',
      priceMonthly: 149,
      priceAnnual: 1430,
      aiRepliesQuota: 20000,
      whatsAppAccounts: 3,
      productLimit: 999999,
      teamMembersLimit: 10,
      voiceAiAllowed: true,
      visionAiAllowed: true,
      campaignsAllowed: true,
      campaignQuota: 10000,
      advancedAnalytics: true,
      apiAccessAllowed: true,
    },
  });

  console.log('✅ Plans seeded');

  // 2. Seed Super Admin User
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@whatsappai.com' },
    update: {},
    create: {
      email: 'admin@whatsappai.com',
      passwordHash: adminPasswordHash,
      name: 'Super Admin',
      systemRole: Role.SUPER_ADMIN,
      isVerified: true,
    },
  });

  // 3. Seed Demo Business Owner
  const ownerPasswordHash = await bcrypt.hash('Owner123!', 10);
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@demofashion.com' },
    update: {},
    create: {
      email: 'owner@demofashion.com',
      passwordHash: ownerPasswordHash,
      name: 'Kasun Perera',
      systemRole: Role.BUSINESS_OWNER,
      isVerified: true,
    },
  });

  // 4. Seed Demo Business: "Demo Fashion Store"
  const business = await prisma.business.upsert({
    where: { slug: 'demo-fashion' },
    update: {},
    create: {
      name: 'Demo Fashion Store',
      slug: 'demo-fashion',
      businessType: 'Clothing Store',
      country: 'LK',
      timezone: 'Asia/Colombo',
      currency: 'LKR',
      defaultLanguage: 'AUTO',
      openingHours: {
        monday: '9:00 AM - 8:00 PM',
        tuesday: '9:00 AM - 8:00 PM',
        wednesday: '9:00 AM - 8:00 PM',
        thursday: '9:00 AM - 8:00 PM',
        friday: '9:00 AM - 8:00 PM',
        saturday: '9:00 AM - 8:00 PM',
        sunday: '10:00 AM - 6:00 PM',
      },
      deliveryInfo: {
        islandwide: true,
        fee: 350,
        freeDeliveryAbove: 10000,
        estimatedDays: '2-3 business days',
      },
      paymentMethods: ['COD', 'Bank Transfer', 'Card Online'],
      codAvailable: true,
      returnPolicy: '7 days return or exchange policy for unopened/unworn items.',
      locations: ['No 45, Galle Road, Colombo 03'],
      contactEmail: 'support@demofashion.lk',
      contactPhone: '+94771234567',
      members: {
        create: {
          userId: ownerUser.id,
          role: Role.BUSINESS_OWNER,
        },
      },
      aiConfig: {
        create: {
          aiName: 'Maya',
          welcomeMessage: 'ආයුබෝවන්! Demo Fashion Store වෙත සාදරයෙන් පිළිගනිමු. මම Maya. ඔයාට ඇඳුම් තෝරගන්න හරි order එකක් දාන්න හරි මම උදව් කරන්නද?',
          tone: 'FRIENDLY',
          defaultLanguage: 'AUTO',
          emojiLevel: 'MEDIUM',
          customInstructions: 'Be polite, helpful, and support Sinhala, Singlish, and English.',
          autoReplyEnabled: true,
          voiceEnabled: true,
          visionEnabled: true,
          autoOrderEnabled: true,
          autoResumeHours: 2,
        },
      },
    },
  });

  // Attach Pro Subscription to Demo Business
  await prisma.subscription.create({
    data: {
      businessId: business.id,
      planId: proPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Demo Business & AI Config seeded');

  // 5. Seed Category & Products
  const category = await prisma.category.create({
    data: {
      businessId: business.id,
      name: 'T-Shirts & Tops',
      slug: 't-shirts-tops',
      description: 'Men & Women Premium Oversized T-Shirts',
    },
  });

  const product1 = await prisma.product.create({
    data: {
      businessId: business.id,
      categoryId: category.id,
      name: 'Black Oversized T-Shirt',
      slug: 'black-oversized-t-shirt',
      sku: 'TSH-BLK-001',
      description: '100% Heavyweight Cotton Black Oversized Streetwear T-Shirt. Premium quality finish.',
      price: 4500,
      currency: 'LKR',
      status: ProductStatus.ACTIVE,
      tags: ['black', 'tshirt', 'oversized', 'cotton', 'unisex', 'casual'],
      searchableText: 'black tshirt oversized black t shirt cotton casual xl l m',
      variants: {
        create: [
          { sku: 'TSH-BLK-001-M', size: 'M', color: 'Black', stock: 15 },
          { sku: 'TSH-BLK-001-L', size: 'L', color: 'Black', stock: 20 },
          { sku: 'TSH-BLK-001-XL', size: 'XL', color: 'Black', stock: 10 },
        ],
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', isPrimary: true, order: 0 },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      businessId: business.id,
      categoryId: category.id,
      name: 'White Essential T-Shirt',
      slug: 'white-essential-t-shirt',
      sku: 'TSH-WHT-002',
      description: 'Classic minimalist White Crewneck Cotton T-Shirt.',
      price: 3800,
      currency: 'LKR',
      status: ProductStatus.ACTIVE,
      tags: ['white', 'tshirt', 'essential', 'cotton'],
      searchableText: 'white tshirt essential white t shirt cotton m l xl',
      variants: {
        create: [
          { sku: 'TSH-WHT-002-M', size: 'M', color: 'White', stock: 12 },
          { sku: 'TSH-WHT-002-L', size: 'L', color: 'White', stock: 8 },
          { sku: 'TSH-WHT-002-XL', size: 'XL', color: 'White', stock: 0 },
        ],
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800', isPrimary: true, order: 0 },
        ],
      },
    },
  });

  console.log('✅ Demo Products seeded');

  // 6. Seed Knowledge Base Documents
  await prisma.knowledgeDocument.createMany({
    data: [
      {
        businessId: business.id,
        title: 'Opening Hours',
        documentType: 'STORE_INFO',
        content: 'We are open Monday to Saturday from 9:00 AM to 8:00 PM, and Sunday from 10:00 AM to 6:00 PM.',
      },
      {
        businessId: business.id,
        title: 'Delivery Policy & COD',
        documentType: 'POLICY',
        content: 'Islandwide delivery fee is Rs. 350 flat rate. Free delivery for orders above Rs. 10,000. Delivery takes 2-3 business days. Cash on Delivery (COD) is available islandwide.',
      },
      {
        businessId: business.id,
        title: 'Return & Exchange Policy',
        documentType: 'POLICY',
        content: 'We accept returns or size exchanges within 7 days of delivery. Items must be unworn with original tags attached.',
      },
    ],
  });

  console.log('✅ Demo Knowledge Documents seeded');

  // 7. Seed Demo Customer & Conversation
  const customer = await prisma.customer.create({
    data: {
      businessId: business.id,
      phone: '+94779876543',
      whatsappId: '94779876543@s.whatsapp.net',
      name: 'Nimal Perera',
      language: 'AUTO',
      tags: ['Repeat Customer', 'VIP'],
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      businessId: business.id,
      customerId: customer.id,
      mode: ConversationMode.AI,
      lastMessageText: 'black tshirt XL තියෙනවද?',
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: MessageSender.CUSTOMER,
      messageType: MessageType.TEXT,
      content: 'black tshirt XL තියෙනවද?',
    },
  });

  console.log('✅ Demo Customer & Conversation seeded');
  console.log('🚀 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
