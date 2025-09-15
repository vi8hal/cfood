'use server';

import { getPersonalizedRecipeRecommendations } from '@/ai/flows/personalized-recipe-recommendations';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const recommendationSchema = z.object({
  dietaryPreferences: z.string().optional(),
  availableIngredients: z.string(),
});

export async function getRecommendations(
  prevState: any,
  formData: FormData
) {
  const validatedFields = recommendationSchema.safeParse({
    dietaryPreferences: formData.get('dietaryPreferences'),
    availableIngredients: formData.get('availableIngredients'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      recommendations: [],
    };
  }

  const { dietaryPreferences, availableIngredients } = validatedFields.data;

  try {
    const result = await getPersonalizedRecipeRecommendations({
      dietaryPreferences: dietaryPreferences
        ? dietaryPreferences.split(',').map((s) => s.trim())
        : [],
      availableIngredients: availableIngredients
        .split(',')
        .map((s) => s.trim()),
      pastInteractions: ['liked Spicy Tomato Pasta'], // Mocked data
      location: 'San Francisco, CA', // Mocked data
    });

    return {
      message: 'Recommendations generated!',
      recommendations: result.recommendedRecipes,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate recommendations.',
      recommendations: [],
    };
  }
}

export async function seedDatabase() {
  const prisma = new PrismaClient();
  try {
    console.log('Start seeding ...');
    
    // Clear existing data
    await prisma.recipe.deleteMany();
    await prisma.user.deleteMany();
    console.log('Cleared existing data.');

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
          password: `password${i + 1}`, // In a real app, hash this!
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
          price:
            i % 3 === 0 ? 0 : parseFloat((Math.random() * 20 + 5).toFixed(2)),
          prepTime: Math.floor(Math.random() * 20) + 10,
          cookTime: Math.floor(Math.random() * 40) + 15,
          servings: Math.floor(Math.random() * 4) + 2,
          ingredients: JSON.stringify([
            { item: 'Main Ingredient', quantity: '1 unit' },
            { item: 'Spice', quantity: '2 tsp' },
            { item: 'Vegetable', quantity: '1 cup' },
          ]),
          instructions: JSON.stringify([
            'Prepare the ingredients.',
            'Cook the main protein.',
            'Combine all ingredients and cook for 20 minutes.',
            'Serve hot and enjoy.',
          ]),
          tags: JSON.stringify(i % 2 === 0 ? ['Quick'] : ['Vegan', 'Gluten-Free']),
          authorId: user.id,
        },
      });
      console.log(`Created recipe with id: ${recipe.id} for user ${user.id}`);
    }

    console.log('Seeding finished.');
    return { message: 'Database seeded successfully!', error: null };
  } catch (e) {
    console.error(e);
    // @ts-ignore
    return { message: 'Failed to seed database.', error: e.message };
  } finally {
    await prisma.$disconnect();
  }
}
