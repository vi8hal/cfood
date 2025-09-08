'use server';
/**
 * @fileOverview AI-powered recipe summarization flow.
 *
 * - summarizeRecipe - A function that generates a concise summary of a recipe.
 * - SummarizeRecipeInput - The input type for the summarizeRecipe function, including the full recipe text.
 * - SummarizeRecipeOutput - The return type for the summarizeRecipe function, containing the recipe summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRecipeInputSchema = z.object({
  recipeText: z.string().describe('The full text of the recipe to summarize.'),
});
export type SummarizeRecipeInput = z.infer<typeof SummarizeRecipeInputSchema>;

const SummarizeRecipeOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the recipe.'),
});
export type SummarizeRecipeOutput = z.infer<typeof SummarizeRecipeOutputSchema>;

export async function summarizeRecipe(input: SummarizeRecipeInput): Promise<SummarizeRecipeOutput> {
  return summarizeRecipeFlow(input);
}

const summarizeRecipePrompt = ai.definePrompt({
  name: 'summarizeRecipePrompt',
  input: {schema: SummarizeRecipeInputSchema},
  output: {schema: SummarizeRecipeOutputSchema},
  prompt: `Summarize the following recipe in a single, short sentence:

{{{recipeText}}}`,
});

const summarizeRecipeFlow = ai.defineFlow(
  {
    name: 'summarizeRecipeFlow',
    inputSchema: SummarizeRecipeInputSchema,
    outputSchema: SummarizeRecipeOutputSchema,
  },
  async input => {
    const {output} = await summarizeRecipePrompt(input);
    return output!;
  }
);
