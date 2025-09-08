"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, LoaderCircle } from "lucide-react";
import { getRecommendations } from "@/lib/actions";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

const initialState = {
  message: "",
  recommendations: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Get Recommendations
    </Button>
  );
}

export default function AiRecommendations() {
  const [state, formAction] = useFormState(getRecommendations, initialState);

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-2 font-headline">AI Recipe Discovery</h2>
      <p className="text-muted-foreground text-center mb-8">
        Let our AI find the perfect recipe for you based on what you have on hand.
      </p>
      <form action={formAction} className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="availableIngredients">Available Ingredients</Label>
          <Input
            id="availableIngredients"
            name="availableIngredients"
            type="text"
            placeholder="e.g., chicken, tomatoes, rice"
            required
          />
          <p className="text-sm text-muted-foreground">
            Separate ingredients with a comma.
          </p>
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="dietaryPreferences">Dietary Preferences (optional)</Label>
          <Input
            id="dietaryPreferences"
            name="dietaryPreferences"
            type="text"
            placeholder="e.g., vegetarian, gluten-free"
          />
        </div>
        <SubmitButton />
      </form>

      {state.recommendations && state.recommendations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 font-headline">Here are your recommendations:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.recommendations.map((rec: string, index: number) => (
              <Card key={index} className="bg-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-accent" />
                    {rec}
                  </CardTitle>
                  <CardDescription>
                    A delicious recipe suggestion from our AI.
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
      {state.message && !state.recommendations.length && (
         <p className="mt-4 text-center text-muted-foreground">{state.message === "Recommendations generated!" ? "No recommendations found. Try different ingredients." : state.message}</p>
      )}
    </div>
  );
}
