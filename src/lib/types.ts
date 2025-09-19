import { z } from "zod";
import { RecipeSchema } from "./actions";

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: {item: string; quantity: string}[];
  instructions: string[];
  tags: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  authorId: string;
  price: number;
  location: string;
  contact?: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    location?: string | null;
  };
  // This field is not in the current DB schema but is expected by components.
  // We can add them later or keep them as mock data.
  authorImage?: string;
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  phone?: string;
};

export type MapLocation = {
  id: string;
  name: string;
  recipeId: string;
  recipeTitle: string;
  position: {
    lat: number;
    lng: number;
  };
};

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  location?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FormState = {
  status: 'success' | 'error';
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

export type RecipeFormValues = z.infer<typeof RecipeSchema>;


export type SessionPayload = {
  userId: string;
  expires: string; // ISO 8601 date string
};
