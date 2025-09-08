"use server";

import { getPersonalizedRecipeRecommendations } from "@/ai/flows/personalized-recipe-recommendations";
import { z } from "zod";

const recommendationSchema = z.object({
  dietaryPreferences: z.string().optional(),
  availableIngredients: z.string(),
});

export async function getRecommendations(
  prevState: any,
  formData: FormData
) {
  const validatedFields = recommendationSchema.safeParse({
    dietaryPreferences: formData.get("dietaryPreferences"),
    availableIngredients: formData.get("availableIngredients"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      recommendations: [],
    };
  }

  const { dietaryPreferences, availableIngredients } = validatedFields.data;

  try {
    const result = await getPersonalizedRecipeRecommendations({
      dietaryPreferences: dietaryPreferences ? dietaryPreferences.split(",").map(s => s.trim()) : [],
      availableIngredients: availableIngredients.split(",").map(s => s.trim()),
      pastInteractions: ["liked Spicy Tomato Pasta"], // Mocked data
      location: "San Francisco, CA", // Mocked data
    });

    return {
      message: "Recommendations generated!",
      recommendations: result.recommendedRecipes,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Failed to generate recommendations.",
      recommendations: [],
    };
  }
}
