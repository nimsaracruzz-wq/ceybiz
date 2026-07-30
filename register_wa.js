const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Step 1: Get the business
  const business = await prisma.business.findFirst({
    select: { id: true, slug: true, name: true },
  });
  
  if (!business) {
    console.log('ERROR: No business found!');
    return;
  }
  
  console.log('Business found:', JSON.stringify(business));

  // Step 2: Delete old/existing WhatsApp accounts for this business
  await prisma.whatsAppAccount.deleteMany({
    where: { businessId: business.id },
  });

  // Step 3: Insert the new WhatsApp account
  const account = await prisma.whatsAppAccount.create({
    data: {
      businessId: business.id,
      phoneNumberId: '1150528594819826',
      wabaId: '2533348427170652',
      phoneNumber: '+818082135428',
      displayPhoneNumber: '+81 80-8213-5428',
      verifiedName: 'CeyBiz Test',
      accessToken: 'EAAZATISAImT0BSPTc9E684ZCYfiFEjzcVMRWJWjFHwfkhDozgZCJlDM23m2G2dvpiopXZCnfEGAfojjjOYwZA3tqisHnSx7AIeZCOwS1jdPrVY4ZAQZAy6POsZBD7HaaZAiVnGDcErk6nCRQoPfBXXXjmbZC0ZAIpJ1A3Slt6gGCOZBSK7wXuggPxCoXst8tGQZBNLPAZDZD',
      webhookVerifyToken: 'wh_verify_secret_123',
      isActive: true,
    },
  });

  console.log('SUCCESS: WhatsApp account registered!', JSON.stringify(account));
}

main()
  .catch((e) => console.error('ERROR:', e.message))
  .finally(() => prisma.$disconnect());
