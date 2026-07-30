const { PrismaClient, ProductStatus } = require('@prisma/client');
const prisma = new PrismaClient();

const demoProducts = [
  {
    name: 'Black Oversized T-Shirt',
    sku: 'TSH-BLK-001',
    description: '100% Premium heavy cotton oversized streetwear t-shirt with dropped shoulders and relaxed fit.',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'S', stock: 15 },
      { size: 'M', stock: 25 },
      { size: 'L', stock: 20 },
      { size: 'XL', stock: 10 },
    ],
  },
  {
    name: 'White Essential Minimal T-Shirt',
    sku: 'TSH-WHT-002',
    description: 'Ultra-soft combed cotton everyday essential crewneck t-shirt. Breathable and durable.',
    price: 3800,
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'M', stock: 30 },
      { size: 'L', stock: 25 },
      { size: 'XL', stock: 15 },
    ],
  },
  {
    name: 'Vintage Wash Denim Jacket',
    sku: 'JCK-DNM-003',
    description: 'Classic unisex vintage washed denim jacket with metal button closures and dual chest pockets.',
    price: 12500,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'M', stock: 8 },
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 5 },
    ],
  },
  {
    name: 'Beige Cargo Jogger Pants',
    sku: 'PNT-CRG-004',
    description: 'Relaxed fit utility cargo pants with elastic drawstring waistband and 6 functional pockets.',
    price: 6800,
    imageUrl: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 15 },
    ],
  },
  {
    name: 'Charcoal Grey Pullover Hoodie',
    sku: 'HOD-GRY-005',
    description: 'Cozy fleece-lined heavyweight pullover hoodie with kangaroo pocket and double-lined hood.',
    price: 8900,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'M', stock: 18 },
      { size: 'L', stock: 22 },
      { size: 'XL', stock: 14 },
    ],
  },
];

async function main() {
  const business = await prisma.business.findFirst();
  if (!business) {
    console.error('No business tenant found!');
    return;
  }

  console.log(`Adding demo products for business: ${business.name} (${business.id})`);

  for (const item of demoProducts) {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if product with SKU exists
    const existing = await prisma.product.findFirst({
      where: { businessId: business.id, sku: item.sku },
    });

    if (existing) {
      console.log(`Skipping existing product: ${item.name} (${item.sku})`);
      continue;
    }

    const created = await prisma.product.create({
      data: {
        businessId: business.id,
        name: item.name,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        sku: item.sku,
        description: item.description,
        price: item.price,
        status: ProductStatus.ACTIVE,
        searchableText: `${item.name} ${item.description} ${item.sku}`,
        variants: {
          create: item.variants.map((v) => ({
            sku: `${item.sku}-${v.size}`,
            size: v.size,
            stock: v.stock,
          })),
        },
        images: {
          create: [{ url: item.imageUrl, isPrimary: true }],
        },
      },
    });

    console.log(`✅ Created Product: ${created.name} (SKU: ${created.sku}, Price: Rs. ${created.price})`);
  }

  console.log('🎉 Demo products successfully added to store database!');
}

main()
  .catch((e) => console.error('Error adding demo products:', e.message))
  .finally(() => prisma.$disconnect());
