
export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: { item: string; quantity: string }[];
  instructions: string[];
  tags: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  author_id: string;
  price: number;
  created_at: Date;
  updated_at: Date;
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
  image?: string;
  location?: string;
};


export type FormState =
  | {
      status: 'success';
      message: string;
    }
  | {
      status: 'error';
      message: string;
      errors?: Array<{
        path: string;
        message: string;
      }>;
    }
  | null;
