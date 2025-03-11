import IngredientForm from "@/components/ingredients/IngredientForm";

export default function NewIngredient() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Ingredient</h1>
      <IngredientForm mode="create" />
    </div>
  );
}
