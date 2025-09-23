"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { LoaderCircle, Upload } from "lucide-react";
import { createRecipeAction } from "@/lib/actions";
import { RecipeSchema } from "@/lib/schemas";
import type { FormState, RecipeFormValues } from "@/lib/types";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
      {pending ? 'Submitting...' : 'Submit Recipe'}
    </Button>
  );
}

export function RecipeUploadForm() {
  const { toast } = useToast();
  const [state, formAction] = useActionState<FormState, FormData>(createRecipeAction, null);
  
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(RecipeSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      contact: "",
      ingredients: "",
      instructions: "",
      price: 0,
      prepTime: 0,
      cookTime: 0,
      servings: 0,
    },
  });

  useEffect(() => {
    if (state?.status === 'success') {
      toast({
        title: "Recipe Submitted!",
        description: state.message,
      });
      form.reset();
    } else if (state?.status === 'error' && state.message && !state.fieldErrors) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: state.message,
      });
    }
  }, [state, form, toast]);


  // Set form errors from server action
  useEffect(() => {
    if (state?.fieldErrors) {
      for (const [fieldName, errors] of Object.entries(state.fieldErrors)) {
        if (errors) {
          form.setError(fieldName as keyof RecipeFormValues, {
            type: 'server',
            message: errors.join(', '),
          });
        }
      }
    }
  }, [state, form]);


  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Share Your Recipe</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form action={formAction} className="space-y-8">
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
            <div className="grid md:grid-cols-2 gap-8">
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="12.99 or 0 if free" {...field} />
                    </FormControl>
                    <FormDescription>Enter a price for your dish, or 0 if it's free.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Pickup Location</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., San Francisco, CA" {...field} />
                    </FormControl>
                     <FormDescription>Where can this be picked up?</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Info (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., phone number for coordination" {...field} />
                    </FormControl>
                    <FormDescription>How can people contact you? Your email is shared by default.</FormDescription>
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
                      placeholder="List each ingredient on a new line. e.g.&#10;1 cup Flour&#10;2 Eggs"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    List each ingredient and its quantity on a new line.
                  </FormDescription>
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
                      placeholder="Provide step-by-step instructions. Enter each step on a new line."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Enter each instruction step on a new line.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SubmitButton />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
