import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    include: {
      membershipCards: true,
    },
  });

  console.log(`Total Customers: ${customers.length}`);
  customers.forEach(c => {
    console.log(`Customer: ${c.firstName} ${c.lastName} (${c.customerCode})`);
    console.log(`  Cards: ${c.membershipCards.length}`);
    c.membershipCards.forEach(card => {
      console.log(`    - Card: ${card.cardNumber}, Status: ${card.status}`);
    });
  });

  const totalCards = await prisma.membershipCard.count();
  console.log(`Total Cards in DB: ${totalCards}`);
}

main().finally(() => prisma.$disconnect());
