// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up (order matters due to foreign keys)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();

  // ── Restaurant 1: BurgerHouse ──────────────────────────────────────────────
  const burgerHouse = await prisma.restaurant.create({
    data: {
      name: 'BurgerHouse',
      description: 'Premium smash burgers & loaded fries since 2018.',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      address: '12 Tahrir Square, Cairo',
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: burgerHouse.id,
        name: 'Classic Smash Burger',
        description: 'Double smash patty, American cheese, pickles, special sauce',
        price: 89,
        category: 'Burgers',
        imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600',
      },
      {
        restaurantId: burgerHouse.id,
        name: 'Crispy Chicken Sandwich',
        description: 'Buttermilk fried chicken, coleslaw, sriracha mayo',
        price: 79,
        category: 'Sandwiches',
        imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600',
      },
      {
        restaurantId: burgerHouse.id,
        name: 'Loaded Cheese Fries',
        description: 'Crispy fries, cheddar sauce, jalapeños, bacon bits',
        price: 49,
        category: 'Sides',
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
      },
      {
        restaurantId: burgerHouse.id,
        name: 'BBQ Bacon Burger',
        description: 'Triple smash, crispy bacon, caramelized onions, BBQ sauce',
        price: 109,
        category: 'Burgers',
        imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=600',
      },
      {
        restaurantId: burgerHouse.id,
        name: 'Chocolate Milkshake',
        description: 'Thick Belgian chocolate shake, whipped cream',
        price: 39,
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600',
      },
      {
        restaurantId: burgerHouse.id,
        name: 'Onion Rings',
        description: 'Beer-battered golden onion rings, chipotle dip',
        price: 35,
        category: 'Sides',
        imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600',
      },
    ],
  });

  // ── Restaurant 2: Spice Garden ─────────────────────────────────────────────
  const spiceGarden = await prisma.restaurant.create({
    data: {
      name: 'Spice Garden',
      description: 'Authentic Egyptian & Levantine cuisine, made with love.',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      address: '7 Zamalek Corniche, Cairo',
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: spiceGarden.id,
        name: 'Koshary Supreme',
        description: "Egypt's national dish — rice, lentils, pasta, crispy onions, spicy tomato sauce",
        price: 45,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
      },
      {
        restaurantId: spiceGarden.id,
        name: 'Mixed Grill Platter',
        description: 'Kofta, shish tawook, lamb chops, grilled veggies & rice',
        price: 149,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
      },
      {
        restaurantId: spiceGarden.id,
        name: 'Hummus & Pita',
        description: 'Creamy hummus, olive oil drizzle, fresh warm pita',
        price: 35,
        category: 'Starters',
        imageUrl: 'https://images.unsplash.com/photo-1576897702138-b3e08a1e2e90?w=600',
      },
      {
        restaurantId: spiceGarden.id,
        name: 'Fattoush Salad',
        description: 'Crispy pita chips, fresh greens, pomegranate molasses dressing',
        price: 45,
        category: 'Salads',
        imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600',
      },
      {
        restaurantId: spiceGarden.id,
        name: 'Om Ali',
        description: "Egypt's classic bread pudding with milk, nuts & raisins",
        price: 40,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600',
      },
      {
        restaurantId: spiceGarden.id,
        name: 'Fresh Lemon Mint',
        description: 'Cold-pressed lemon, garden mint, cane sugar',
        price: 25,
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600',
      },
    ],
  });

  console.log('✅ Seeded:');
  console.log(`   - 2 restaurants`);
  console.log(`   - 12 menu items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
