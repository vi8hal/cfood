'use server';

import { getPersonalizedRecipeRecommendations } from '@/ai/flows/personalized-recipe-recommendations';
import { z } from 'zod';

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
  // This function will be properly implemented in a later step
  // when the database is fully configured.
  console.log('Seeding the database...');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
  console.log('Database seeding is not yet implemented.');
  return { message: 'Seeding process needs to be set up.', error: null };
}
