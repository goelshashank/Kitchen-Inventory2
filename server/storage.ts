import { 
  type Ingredient, 
  type InsertIngredient, 
  type Recipe, 
  type InsertRecipe,
  type RecipeIngredient,
  type RecipeWithIngredients,
  ingredients,
  recipes,
  recipeIngredients,
  UNITS
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";

export interface IStorage {
  // Ingredients
  getIngredient(id: number): Promise<Ingredient | undefined>;
  getAllIngredients(): Promise<Ingredient[]>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredient(id: number, ingredient: InsertIngredient): Promise<Ingredient | undefined>;
  deleteIngredient(id: number): Promise<boolean>;

  // Recipes
  getRecipe(id: number): Promise<Recipe | undefined>;
  getAllRecipes(): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: number, recipe: InsertRecipe): Promise<Recipe | undefined>;
  deleteRecipe(id: number): Promise<boolean>;

  // Recipe ingredients
  getRecipeWithIngredients(id: number): Promise<RecipeWithIngredients | undefined>;
  getAllRecipesWithIngredients(): Promise<RecipeWithIngredients[]>;
  addIngredientsToRecipe(recipeId: number, ingredients: any[]): Promise<RecipeIngredient[]>;
  updateRecipeIngredients(recipeId: number, ingredients: any[]): Promise<RecipeIngredient[]>;
}

export class DatabaseStorage implements IStorage {
  // Ingredients methods
  async getIngredient(id: number): Promise<Ingredient | undefined> {
    const [ingredient] = await db.select().from(ingredients).where(eq(ingredients.id, id));
    return ingredient || undefined;
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return await db.select().from(ingredients);
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const [newIngredient] = await db.insert(ingredients)
      .values(ingredient)
      .returning();
    return newIngredient;
  }

  async updateIngredient(id: number, ingredient: InsertIngredient): Promise<Ingredient | undefined> {
    const [updatedIngredient] = await db.update(ingredients)
      .set(ingredient)
      .where(eq(ingredients.id, id))
      .returning();
    return updatedIngredient || undefined;
  }

  async deleteIngredient(id: number): Promise<boolean> {
    const [deleted] = await db.delete(ingredients)
      .where(eq(ingredients.id, id))
      .returning();
    return !!deleted;
  }

  // Recipes methods
  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe || undefined;
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db.insert(recipes)
      .values(recipe)
      .returning();
    return newRecipe;
  }

  async updateRecipe(id: number, recipe: InsertRecipe): Promise<Recipe | undefined> {
    const [updatedRecipe] = await db.update(recipes)
      .set(recipe)
      .where(eq(recipes.id, id))
      .returning();
    return updatedRecipe || undefined;
  }

  async deleteRecipe(id: number): Promise<boolean> {
    const [deleted] = await db.delete(recipes)
      .where(eq(recipes.id, id))
      .returning();
    return !!deleted;
  }

  // Recipe ingredients methods
  async getRecipeWithIngredients(id: number): Promise<RecipeWithIngredients | undefined> {
    // First, get the recipe
    const recipe = await this.getRecipe(id);
    if (!recipe) return undefined;

    // Then, get all recipe ingredients for this recipe
    const recipeIngredientsData = await db.select()
      .from(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, id));

    if (recipeIngredientsData.length === 0) {
      return { ...recipe, ingredients: [] };
    }

    // Get all ingredient IDs
    const ingredientIds = recipeIngredientsData.map(ri => ri.ingredientId);
    
    // Fetch all ingredients in one query
    const ingredientsData = await db.select()
      .from(ingredients)
      .where(inArray(ingredients.id, ingredientIds));
    
    // Map ingredients to recipe ingredients
    const recipeIngredientsMapped = recipeIngredientsData.map(ri => {
      const ingredient = ingredientsData.find(i => i.id === ri.ingredientId)!;
      return {
        ...ri,
        ingredient
      };
    });

    // Return the complete recipe
    return {
      ...recipe,
      ingredients: recipeIngredientsMapped
    };
  }

  async getAllRecipesWithIngredients(): Promise<RecipeWithIngredients[]> {
    // Get all recipes
    const allRecipes = await this.getAllRecipes();
    
    // Get all recipe ingredients
    const allRecipeIngredients = await db.select().from(recipeIngredients);
    
    // Get all ingredients
    const allIngredients = await this.getAllIngredients();
    
    // Map recipes to their ingredients
    return allRecipes.map(recipe => {
      const recipeIngredientsData = allRecipeIngredients.filter(
        ri => ri.recipeId === recipe.id
      );
      
      const ingredientsWithData = recipeIngredientsData.map(ri => {
        const ingredient = allIngredients.find(i => i.id === ri.ingredientId)!;
        return {
          ...ri,
          ingredient
        };
      });
      
      return {
        ...recipe,
        ingredients: ingredientsWithData
      };
    });
  }

  async addIngredientsToRecipe(recipeId: number, ingredientsToAdd: any[]): Promise<RecipeIngredient[]> {
    // Check if recipe exists
    const recipe = await this.getRecipe(recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    
    // Add each ingredient to the recipe
    const newRecipeIngredients = await db.insert(recipeIngredients)
      .values(
        ingredientsToAdd.map(item => ({
          recipeId,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          unit: item.unit as typeof UNITS[number]
        }))
      )
      .returning();
    
    return newRecipeIngredients;
  }

  async updateRecipeIngredients(recipeId: number, ingredientsToUpdate: any[]): Promise<RecipeIngredient[]> {
    // Check if recipe exists
    const recipe = await this.getRecipe(recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    
    // First, delete all existing ingredients for this recipe
    await db.delete(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, recipeId));
    
    // If there are no new ingredients to add, return empty array
    if (ingredientsToUpdate.length === 0) {
      return [];
    }
    
    // Add the new ingredients
    return this.addIngredientsToRecipe(recipeId, ingredientsToUpdate);
  }
}

// Initialize the storage implementation - using DatabaseStorage now
export const storage = new DatabaseStorage();
