"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const recipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  ingredients: z
    .string()
    .min(10, "Please list at least one ingredient"),
  instructions: z
    .string()
    .min(20, "Instructions must be at least 20 characters long"),
  prepTime: z.coerce.number().positive("Prep time must be a positive number"),
  cookTime: z.coerce.number().positive("Cook time must be a positive number"),
  servings: z.coerce.number().positive("Servings must be a positive number"),
  image: z.any()
    .refine((file) => file?.length == 1, "Image is required.")
    .refine((file) => file?.[0]?.size <= 5000000, `Max file size is 5MB.`),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

export function RecipeUploadForm() {
  const { toast } = useToast();
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      description: "",
      ingredients: "",
      instructions: "",
    },
  });
  const imageRef = form.register("image");


  function onSubmit(data: RecipeFormValues) {
    console.log(data);
    toast({
      title: "Recipe Submitted!",
      description: "Your recipe has been successfully submitted for review.",
    });
    form.reset();
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Share Your Recipe</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spicy Tomato Pasta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short and enticing description of your dish..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-3 gap-8">
                <FormField
                control={form.control}
                name="prepTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Prep Time (minutes)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="15" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="cookTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Cook Time (minutes)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="25" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="servings"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Servings</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="4" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List each ingredient on a new line. e.g.&#10;500g Pasta&#10;1 can Canned Tomatoes"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide step-by-step instructions for preparing your dish."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Image</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" {...imageRef} />
                  </FormControl>
                   <FormDescription>
                    Upload a high-quality photo of your finished dish (max 5MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              <Upload className="mr-2 h-4 w-4" /> Submit Recipe
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
