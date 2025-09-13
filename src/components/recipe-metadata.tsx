import { Card, CardContent } from "@/components/ui/card";
import type { Recipe } from "@/lib/types";
import { Clock, ChefHat, Users } from "lucide-react";

interface RecipeMetadataProps {
    recipe: Pick<Recipe, 'prepTime' | 'cookTime' | 'servings'>;
}

export function RecipeMetadata({ recipe }: RecipeMetadataProps) {
    return (
        <Card>
            <CardContent className="p-6">
              <div className="flex justify-around text-center">
                <div>
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{recipe.prepTime} min</p>
                  <p className="text-sm text-muted-foreground">Prep</p>
                </div>
                <div>
                  <ChefHat className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{recipe.cookTime} min</p>
                  <p className="text-sm text-muted-foreground">Cook</p>
                </div>
                <div>
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{recipe.servings}</p>
                  <p className="text-sm text-muted-foreground">Servings</p>
                </div>
              </div>
            </CardContent>
        </Card>
    );
}
