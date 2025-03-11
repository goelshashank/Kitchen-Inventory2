import RecipeForm from "@/components/recipes/RecipeForm";

export default function NewRecipe() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Recipe</h1>
      <RecipeForm mode="create" />
    </div>
  );
}
