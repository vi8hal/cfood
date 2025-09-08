export type Recipe = {
  id: string;
  title: string;
  description: string;
  author: string;
  authorImage: string;
  imageUrl: string;
  imageHint: string;
  ingredients: { item: string; quantity: string }[];
  instructions: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  tags: ('Vegan' | 'Gluten-Free' | 'Quick')[];
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
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
