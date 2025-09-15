import type { MapLocation } from './types';

export const mapLocations: MapLocation[] = [
  {
    id: 'loc1',
    name: "Tony's Pasta Place",
    recipeId: '1',
    recipeTitle: 'Spicy Tomato Pasta',
    position: { lat: 34.0522, lng: -118.2437 },
  },
  {
    id: 'loc2',
    name: 'The Sweet Spot Bakery',
    recipeId: '2',
    recipeTitle: 'Gluten-Free Chocolate Cake',
    position: { lat: 34.055, lng: -118.25 },
  },
  {
    id: 'loc3',
    name: "Avocado & Co.",
    recipeId: '3',
    recipeTitle: 'Avocado Toast with a Twist',
    position: { lat: 34.048, lng: -118.24 },
  },
  {
    id: 'loc4',
    name: "The Chicken Roost",
    recipeId: '5',
    recipeTitle: 'One-Pan Lemon Herb Chicken',
    position: { lat: 34.06, lng: -118.23 },
  },
];

export const dummyOrders = [
    { id: 'ORD001', user: 'Bob Johnson', timestamp: '2024-05-20 10:30 AM' },
    { id: 'ORD002', user: 'Charlie Brown', timestamp: '2024-05-20 11:15 AM' },
    { id: 'ORD003', user: 'Diana Prince', timestamp: '2024-05-21 09:00 AM' },
];
