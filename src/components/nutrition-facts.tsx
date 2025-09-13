import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Recipe } from "@/lib/types";

interface NutritionFactsProps {
  nutrition: Recipe['nutrition'];
}

export function NutritionFacts({ nutrition }: NutritionFactsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Nutrition Facts</CardTitle>
        <p className="text-sm text-muted-foreground">per serving</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span>Calories</span>
          <span className="font-semibold">{nutrition.calories}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span>Fat</span>
          <span>{nutrition.fat}g</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span>Carbs</span>
          <span>{nutrition.carbs}g</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span>Protein</span>
          <span>{nutrition.protein}g</span>
        </div>
      </CardContent>
    </Card>
  );
}
