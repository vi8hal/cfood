import type { Recipe as PrismaRecipe, User } from '@prisma/client';

export type Recipe = Omit<PrismaRecipe, 'authorId' | 'ingredients' | 'instructions' | 'tags'> & {
  author: User;
  ingredients: { item: string; quantity: string }[];
  instructions: string[];
  tags: string[];
  // These fields are not in the current DB schema but are expected by components.
  // We can add them later or keep them as mock data.
  authorImage?: string;
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  contact?: string;
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
