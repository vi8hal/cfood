// src/ai/flows/personalized-recipe-recommendations.ts
'use server';

/**
 * @fileOverview Personalized recipe recommendations flow.
 *
 * This flow generates personalized recipe recommendations based on user dietary preferences,
 * available ingredients, and past interactions.
 *
 * @interface PersonalizedRecipeRecommendationsInput - Defines the input schema for the flow.
 * @interface PersonalizedRecipeRecommendationsOutput - Defines the output schema for the flow.
 * @function getPersonalizedRecipeRecommendations - The main function to trigger the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecipeRecommendationsInputSchema = z.object({
  dietaryPreferences: z
    .array(z.string())
    .describe('The dietary preferences of the user (e.g., vegetarian, vegan, gluten-free).'),
  availableIngredients: z
    .array(z.string())
    .describe('The ingredients currently available to the user.'),
  pastInteractions: z
    .array(z.string())
    .describe(
      'The past interactions of the user with recipes (e.g., liked, disliked, viewed).'
    ),
  location: z.string().describe('The user\s current location.'),
});

export type PersonalizedRecipeRecommendationsInput = z.infer<
  typeof PersonalizedRecipeRecommendationsInputSchema
>;

const PersonalizedRecipeRecommendationsOutputSchema = z.object({
  recommendedRecipes: z
    .array(z.string())
    .describe('A list of recommended recipes based on user input.'),
});

export type PersonalizedRecipeRecommendationsOutput = z.infer<
  typeof PersonalizedRecipeRecommendationsOutputSchema
>;

const personalizedRecipeRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecipeRecommendationsPrompt',
  input: {schema: PersonalizedRecipeRecommendationsInputSchema},
  output: {schema: PersonalizedRecipeRecommendationsOutputSchema},
  prompt: `You are a recipe recommendation expert. Based on the user's dietary preferences,
  available ingredients, past interactions, and location, recommend recipes that the user
  is likely to enjoy.

  Dietary Preferences: {{dietaryPreferences}}
  Available Ingredients: {{availableIngredients}}
  Past Interactions: {{pastInteractions}}
  Location: {{location}}

  Provide a list of recipe names that the user would enjoy.`,
});

/**
 * Flow to generate personalized recipe recommendations.
 * @param input - The input containing user dietary preferences, available ingredients,
 * past interactions, and location.
 * @returns A list of recommended recipes.
 */
const personalizedRecipeRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecipeRecommendationsFlow',
    inputSchema: PersonalizedRecipeRecommendationsInputSchema,
    outputSchema: PersonalizedRecipeRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedRecipeRecommendationsPrompt(input);
    return output!;
  }
);

export async function getPersonalizedRecipeRecommendations(
  input: PersonalizedRecipeRecommendationsInput
): Promise<PersonalizedRecipeRecommendationsOutput> {
  return personalizedRecipeRecommendationsFlow(input);
}

