"use client";

import { useState } from 'react';
import { RecipeCard } from '@/components/recipe-card';
import { Input } from '@/components/ui/input';
import { recipes as allRecipes } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Search } from 'lucide-react';

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

  const filteredRecipes = allRecipes.filter((recipe) => {
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLocation = recipe.location
      ?.toLowerCase()
      .includes(locationTerm.toLowerCase());
    const matchesTag =
      tagFilter === 'all' || recipe.tags.includes(tagFilter as any);
    return matchesSearch && matchesTag && matchesLocation;
  });

  const allTags = ['all', ...Array.from(new Set(allRecipes.flatMap(r => r.tags)))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Explore Recipes</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Find your next culinary adventure.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search recipes by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative flex-grow">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by location..."
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag === 'all' ? 'All Tags' : tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
            ))
        ) : (
            <p className="col-span-full text-center text-muted-foreground">No recipes found. Try adjusting your search or filters.</p>
        )}
      </div>
    </div>
  );
}
