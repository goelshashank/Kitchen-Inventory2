import { 
  type Ingredient, 
  type InsertIngredient, 
  type Recipe, 
  type InsertRecipe,
  type RecipeIngredient,
  type RecipeWithIngredients,
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private ingredients: Map<number, Ingredient>;
  private recipes: Map<number, Recipe>;
  private recipeIngredients: Map<number, Map<number, RecipeIngredient>>;
  private ingredientIdCounter: number;
  private recipeIdCounter: number;

  constructor() {
    this.ingredients = new Map();
    this.recipes = new Map();
    this.recipeIngredients = new Map();
    this.ingredientIdCounter = 1;
    this.recipeIdCounter = 1;

    // Add some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample ingredients
    const milkId = this.ingredientIdCounter++;
    this.ingredients.set(milkId, {
      id: milkId,
      name: "Milk",
      quantity: 750,
      unit: "ml",
      category: "dairy",
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      minimumStock: 1000,
      notes: "Semi-skimmed"
    });

    const flourId = this.ingredientIdCounter++;
    this.ingredients.set(flourId, {
      id: flourId,
      name: "Flour",
      quantity: 100,
      unit: "g",
      category: "dry_goods",
      expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      minimumStock: 500,
      notes: "All-purpose"
    });

    const eggsId = this.ingredientIdCounter++;
    this.ingredients.set(eggsId, {
      id: eggsId,
      name: "Eggs",
      quantity: 2,
      unit: "pcs",
      category: "dairy",
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      minimumStock: 6,
      notes: "Free-range"
    });

    const chickenId = this.ingredientIdCounter++;
    this.ingredients.set(chickenId, {
      id: chickenId,
      name: "Chicken Breast",
      quantity: 500,
      unit: "g",
      category: "meat",
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      minimumStock: 750,
      notes: ""
    });

    const riceId = this.ingredientIdCounter++;
    this.ingredients.set(riceId, {
      id: riceId,
      name: "Rice",
      quantity: 1500,
      unit: "g",
      category: "dry_goods",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      minimumStock: 500,
      notes: "Basmati"
    });

    // Sample recipes
    const pancakesId = this.recipeIdCounter++;
    this.recipes.set(pancakesId, {
      id: pancakesId,
      name: "Pancakes",
      cookTime: 15,
      instructions: "1. Mix flour, eggs, and milk in a bowl.\n2. Heat a pan over medium heat.\n3. Pour batter and cook until bubbles form on the surface.\n4. Flip and cook until golden brown.",
      image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500&q=80",
      notes: "Serve with maple syrup"
    });

    const stirFryId = this.recipeIdCounter++;
    this.recipes.set(stirFryId, {
      id: stirFryId,
      name: "Chicken Stir Fry",
      cookTime: 20,
      instructions: "1. Cut chicken into bite-sized pieces.\n2. Heat oil in a wok or large frying pan.\n3. Add chicken and cook until browned.\n4. Add vegetables and stir-fry for 5 minutes.\n5. Serve over rice.",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500&q=80",
      notes: "Add soy sauce to taste"
    });

    // Recipe ingredients
    // Pancakes recipe ingredients
    this.recipeIngredients.set(pancakesId, new Map());
    this.recipeIngredients.get(pancakesId)?.set(flourId, {
      recipeId: pancakesId,
      ingredientId: flourId,
      quantity: 200,
      unit: "g"
    });
    this.recipeIngredients.get(pancakesId)?.set(eggsId, {
      recipeId: pancakesId,
      ingredientId: eggsId,
      quantity: 2,
      unit: "pcs"
    });
    this.recipeIngredients.get(pancakesId)?.set(milkId, {
      recipeId: pancakesId,
      ingredientId: milkId,
      quantity: 300,
      unit: "ml"
    });

    // Stir fry recipe ingredients
    this.recipeIngredients.set(stirFryId, new Map());
    this.recipeIngredients.get(stirFryId)?.set(chickenId, {
      recipeId: stirFryId,
      ingredientId: chickenId,
      quantity: 400,
      unit: "g"
    });
    this.recipeIngredients.get(stirFryId)?.set(riceId, {
      recipeId: stirFryId,
      ingredientId: riceId,
      quantity: 200,
      unit: "g"
    });
  }

  // Ingredient methods
  async getIngredient(id: number): Promise<Ingredient | undefined> {
    return this.ingredients.get(id);
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values());
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const id = this.ingredientIdCounter++;
    const newIngredient: Ingredient = { id, ...ingredient };
    this.ingredients.set(id, newIngredient);
    return newIngredient;
  }

  async updateIngredient(id: number, ingredient: InsertIngredient): Promise<Ingredient | undefined> {
    if (!this.ingredients.has(id)) {
      return undefined;
    }
    
    const updatedIngredient: Ingredient = { id, ...ingredient };
    this.ingredients.set(id, updatedIngredient);
    return updatedIngredient;
  }

  async deleteIngredient(id: number): Promise<boolean> {
    if (!this.ingredients.has(id)) {
      return false;
    }
    
    // Delete the ingredient
    this.ingredients.delete(id);
    
    // Remove the ingredient from all recipes
    for (const [recipeId, ingredients] of this.recipeIngredients.entries()) {
      if (ingredients.has(id)) {
        ingredients.delete(id);
      }
    }
    
    return true;
  }

  // Recipe methods
  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const id = this.recipeIdCounter++;
    const newRecipe: Recipe = { id, ...recipe };
    this.recipes.set(id, newRecipe);
    this.recipeIngredients.set(id, new Map());
    return newRecipe;
  }

  async updateRecipe(id: number, recipe: InsertRecipe): Promise<Recipe | undefined> {
    if (!this.recipes.has(id)) {
      return undefined;
    }
    
    const updatedRecipe: Recipe = { id, ...recipe };
    this.recipes.set(id, updatedRecipe);
    return updatedRecipe;
  }

  async deleteRecipe(id: number): Promise<boolean> {
    if (!this.recipes.has(id)) {
      return false;
    }
    
    // Delete the recipe
    this.recipes.delete(id);
    
    // Delete its ingredients
    this.recipeIngredients.delete(id);
    
    return true;
  }

  // Recipe ingredients methods
  async getRecipeWithIngredients(id: number): Promise<RecipeWithIngredients | undefined> {
    const recipe = await this.getRecipe(id);
    
    if (!recipe) {
      return undefined;
    }
    
    const recipeIngredientsMap = this.recipeIngredients.get(id) || new Map();
    const ingredientPromises = Array.from(recipeIngredientsMap.values()).map(async (ri) => {
      const ingredient = await this.getIngredient(ri.ingredientId);
      return { ...ri, ingredient: ingredient! };
    });
    
    const ingredients = await Promise.all(ingredientPromises);
    
    return {
      ...recipe,
      ingredients
    };
  }

  async getAllRecipesWithIngredients(): Promise<RecipeWithIngredients[]> {
    const recipes = await this.getAllRecipes();
    const recipesWithIngredients = await Promise.all(
      recipes.map(recipe => this.getRecipeWithIngredients(recipe.id))
    );
    
    return recipesWithIngredients.filter((r): r is RecipeWithIngredients => r !== undefined);
  }

  async addIngredientsToRecipe(recipeId: number, ingredients: any[]): Promise<RecipeIngredient[]> {
    if (!this.recipes.has(recipeId)) {
      throw new Error("Recipe not found");
    }
    
    if (!this.recipeIngredients.has(recipeId)) {
      this.recipeIngredients.set(recipeId, new Map());
    }
    
    const recipeIngredientsMap = this.recipeIngredients.get(recipeId)!;
    
    for (const ingredient of ingredients) {
      const { ingredientId, quantity, unit } = ingredient;
      
      if (!this.ingredients.has(ingredientId)) {
        throw new Error(`Ingredient with ID ${ingredientId} not found`);
      }
      
      recipeIngredientsMap.set(ingredientId, {
        recipeId,
        ingredientId,
        quantity,
        unit
      });
    }
    
    return Array.from(recipeIngredientsMap.values());
  }

  async updateRecipeIngredients(recipeId: number, ingredients: any[]): Promise<RecipeIngredient[]> {
    if (!this.recipes.has(recipeId)) {
      throw new Error("Recipe not found");
    }
    
    // Clear existing ingredients
    this.recipeIngredients.set(recipeId, new Map());
    
    // Add the new ingredients
    return this.addIngredientsToRecipe(recipeId, ingredients);
  }
}

export const storage = new MemStorage();
