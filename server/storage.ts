import { 
  type Ingredient, 
  type InsertIngredient, 
  type Recipe, 
  type InsertRecipe,
  type RecipeIngredient,
  type RecipeWithIngredients,
  UNITS,
  INGREDIENT_CATEGORIES
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";
import * as schema from "@shared/schema";

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
    try {
      const [ingredient] = await db.select().from(schema.ingredients).where(eq(schema.ingredients.id, id));
      return ingredient || undefined;
    } catch (error) {
      console.error('Error in getIngredient:', error);
      throw error;
    }
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    try {
      return await db.select().from(schema.ingredients);
    } catch (error) {
      console.error('Error in getAllIngredients:', error);
      return [];
    }
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    try {
      console.log('Creating ingredient:', ingredient);
      
      // Cast unit and category to their enum types
      const processedIngredient = {
        ...ingredient,
        unit: ingredient.unit as typeof UNITS[number],
        category: ingredient.category as typeof INGREDIENT_CATEGORIES[number]
      };
      
      console.log('Processed ingredient:', processedIngredient);
      
      const [newIngredient] = await db.insert(schema.ingredients)
        .values(processedIngredient as any) // Use 'as any' to bypass TypeScript checking
        .returning();
      return newIngredient;
    } catch (error) {
      console.error('Error in createIngredient:', error);
      throw error;
    }
  }

  async updateIngredient(id: number, ingredient: InsertIngredient): Promise<Ingredient | undefined> {
    try {
      // Cast unit and category to their enum types
      const processedIngredient = {
        ...ingredient,
        unit: ingredient.unit as typeof UNITS[number],
        category: ingredient.category as typeof INGREDIENT_CATEGORIES[number]
      };
      
      console.log('Updating ingredient:', processedIngredient);
      
      const [updatedIngredient] = await db.update(schema.ingredients)
        .set(processedIngredient as any) // Use 'as any' to bypass TypeScript checking
        .where(eq(schema.ingredients.id, id))
        .returning();
      return updatedIngredient || undefined;
    } catch (error) {
      console.error('Error in updateIngredient:', error);
      throw error;
    }
  }

  async deleteIngredient(id: number): Promise<boolean> {
    const [deleted] = await db.delete(schema.ingredients)
      .where(eq(schema.ingredients.id, id))
      .returning();
    return !!deleted;
  }

  // Recipes methods
  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, id));
    return recipe || undefined;
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(schema.recipes);
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db.insert(schema.recipes)
      .values(recipe)
      .returning();
    return newRecipe;
  }

  async updateRecipe(id: number, recipe: InsertRecipe): Promise<Recipe | undefined> {
    const [updatedRecipe] = await db.update(schema.recipes)
      .set(recipe)
      .where(eq(schema.recipes.id, id))
      .returning();
    return updatedRecipe || undefined;
  }

  async deleteRecipe(id: number): Promise<boolean> {
    const [deleted] = await db.delete(schema.recipes)
      .where(eq(schema.recipes.id, id))
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
      .from(schema.recipeIngredients)
      .where(eq(schema.recipeIngredients.recipeId, id));

    if (recipeIngredientsData.length === 0) {
      return { ...recipe, ingredients: [] };
    }

    // Get all ingredient IDs
    const ingredientIds = recipeIngredientsData.map(ri => ri.ingredientId);
    
    // Fetch all ingredients in one query
    const ingredientsData = await db.select()
      .from(schema.ingredients)
      .where(inArray(schema.ingredients.id, ingredientIds));
    
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
    const allRecipeIngredients = await db.select().from(schema.recipeIngredients);
    
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
    const newRecipeIngredients = await db.insert(schema.recipeIngredients)
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
    await db.delete(schema.recipeIngredients)
      .where(eq(schema.recipeIngredients.recipeId, recipeId));
    
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
