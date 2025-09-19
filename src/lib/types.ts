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
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    location?: string | null;
  };
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

export type SessionPayload = {
  userId: string;
  expires: string; // ISO 8601 date string
};
