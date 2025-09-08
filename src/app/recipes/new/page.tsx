import { RecipeUploadForm } from "@/components/recipe-upload-form";

export default function NewRecipePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Add a New Recipe</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Share your culinary creation with the community!
        </p>
      </div>
      <RecipeUploadForm />
    </div>
  );
}
