// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const locations = [
    'San Francisco, CA',
    'Oakland, CA',
    'New York, NY',
    'Austin, TX',
    'Chicago, IL',
  ];

  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i + 1}@example.com`,
        // In a real app, passwords should be hashed!
        password: `password${i + 1}`,
        name: `User ${i + 1}`,
        location: locations[i % locations.length],
      },
    });
    users.push(user);
    console.log(`Created user with id: ${user.id}`);
  }

  const recipeTitles = [
    'Classic Beef Tacos',
    'Vegan Buddha Bowl',
    'Spicy Shrimp Scampi',
    'Mushroom Risotto',
    'BBQ Chicken Pizza',
    'Lemon Dill Salmon',
    'Quinoa Salad with Roasted Vegetables',
    'Homemade Margherita Pizza',
    'Creamy Tomato Soup',
    'Black Bean Burgers',
  ];

  for (let i = 0; i < 10; i++) {
    const user = users[i];
    const recipe = await prisma.recipe.create({
      data: {
        title: recipeTitles[i],
        description: `A delicious recipe for ${recipeTitles[i]} made with love by ${user.name}.`,
        price: i % 3 === 0 ? 0 : parseFloat((Math.random() * 20 + 5).toFixed(2)),
        prepTime: Math.floor(Math.random() * 20) + 10,
        cookTime: Math.floor(Math.random() * 40) + 15,
        servings: Math.floor(Math.random() * 4) + 2,
        ingredients: [
            { item: 'Main Ingredient', quantity: '1 unit' },
            { item: 'Spice', quantity: '2 tsp' },
            { item: 'Vegetable', quantity: '1 cup' },
        ],
        instructions: [
            'Prepare the ingredients.',
            'Cook the main protein.',
            'Combine all ingredients and cook for 20 minutes.',
            'Serve hot and enjoy.',
        ],
        tags: i % 2 === 0 ? ['Quick'] : ['Vegan', 'Gluten-Free'],
        authorId: user.id,
      },
    });
    console.log(`Created recipe with id: ${recipe.id} for user ${user.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
