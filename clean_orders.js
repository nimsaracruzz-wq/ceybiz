const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deletedItems = await prisma.orderItem.deleteMany({});
  console.log('Deleted OrderItems:', deletedItems);

  const deletedHistory = await prisma.orderStatusHistory.deleteMany({});
  console.log('Deleted OrderStatusHistory:', deletedHistory);

  const deletedOrders = await prisma.order.deleteMany({});
  console.log('Deleted Orders:', deletedOrders);
}

main()
  .catch((e) => console.error('Error deleting orders:', e.message))
  .finally(() => prisma.$disconnect());
