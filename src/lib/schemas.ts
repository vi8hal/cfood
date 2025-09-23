import { z } from 'zod';

export const RecipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long.'),
  price: z.coerce
    .number()
    .min(0, "Price must be a positive number or 0 for free."),
  location: z.string().min(3, 'Location is required.'),
  contact: z.string().optional(),
  ingredients: z.string().min(10, 'Please list at least one ingredient.'),
  instructions: z
    .string()
    .min(20, 'Instructions must be at least 20 characters long.'),
  prepTime: z.coerce
    .number()
    .int()
    .positive('Prep time must be a positive number.'),
  cookTime: z.coerce
    .number()
    .int()
    .positive('Cook time must be a positive number.'),
  servings: z.coerce
    .number()
    .int()
    .positive('Servings must be a positive number.'),
});
