import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recipe } from "@/lib/types";
import { Zap, Vegan, WheatOff } from "lucide-react";
import React from 'react';

const tagIcons: { [key in Recipe['tags'][number]]: React.ReactNode } = {
  Quick: <Zap className="h-4 w-4 mr-2" />,
  Vegan: <Vegan className="h-4 w-4 mr-2" />,
  'Gluten-Free': <WheatOff className="h-4 w-4 mr-2" />,
};

interface RecipeDetailsProps {
    tags: Recipe['tags'];
}

export function RecipeDetails({ tags }: RecipeDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tags.map(tag => (
                <div key={tag} className="flex items-center">
                  {tagIcons[tag]}
                  <span className='font-medium'>{tag}</span>
                </div>
              ))}
            </CardContent>
        </Card>
    )
}
