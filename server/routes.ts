import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertIngredientSchema, insertRecipeSchema } from "@shared/schema";
import { differenceInDays, addDays } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // INGREDIENTS ROUTES
  
  // Get all ingredients
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getAllIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve ingredients" });
    }
  });

  // Get single ingredient
  app.get("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ingredient = await storage.getIngredient(id);
      
      if (!ingredient) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      res.json(ingredient);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve ingredient" });
    }
  });

  // Create ingredient
  app.post("/api/ingredients", async (req, res) => {
    try {
      const validatedData = insertIngredientSchema.parse(req.body);
      const ingredient = await storage.createIngredient(validatedData);
      res.status(201).json(ingredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create ingredient" });
    }
  });

  // Update ingredient
  app.patch("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertIngredientSchema.parse(req.body);
      const updatedIngredient = await storage.updateIngredient(id, validatedData);
      
      if (!updatedIngredient) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      res.json(updatedIngredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update ingredient" });
    }
  });

  // Delete ingredient
  app.delete("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteIngredient(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ingredient" });
    }
  });

  // RECIPES ROUTES
  
  // Get all recipes with ingredient status
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipesWithIngredients();
      const ingredients = await storage.getAllIngredients();
      
      // Enhance recipes with missing ingredients information
      const enhancedRecipes = recipes.map(recipe => {
        const missingIngredients = { count: 0, lowStock: false };
        
        recipe.ingredients.forEach(ri => {
          const pantryIngredient = ingredients.find(i => i.id === ri.ingredientId);
          
          // Check if ingredient exists and has enough quantity
          if (!pantryIngredient || pantryIngredient.quantity < ri.quantity) {
            missingIngredients.count++;
          }
          
          // Check if ingredient is low on stock
          if (pantryIngredient && 
              pantryIngredient.minimumStock !== null && 
              pantryIngredient.quantity <= pantryIngredient.minimumStock) {
            missingIngredients.lowStock = true;
          }
        });
        
        return {
          ...recipe,
          missingIngredients
        };
      });
      
      res.json(enhancedRecipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve recipes" });
    }
  });

  // Get single recipe with ingredients
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipeWithIngredients(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve recipe" });
    }
  });

  // Create recipe
  app.post("/api/recipes", async (req, res) => {
    try {
      const validatedData = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(validatedData);
      res.status(201).json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  // Update recipe
  app.patch("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRecipeSchema.parse(req.body);
      const updatedRecipe = await storage.updateRecipe(id, validatedData);
      
      if (!updatedRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(updatedRecipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  // Delete recipe
  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRecipe(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Add ingredients to recipe
  app.post("/api/recipes/:id/ingredients", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      const { ingredients } = req.body;
      
      if (!Array.isArray(ingredients)) {
        return res.status(400).json({ message: "Ingredients must be an array" });
      }
      
      const addedIngredients = await storage.addIngredientsToRecipe(recipeId, ingredients);
      res.status(201).json(addedIngredients);
    } catch (error) {
      res.status(500).json({ message: "Failed to add ingredients to recipe" });
    }
  });

  // Update recipe ingredients (replace all)
  app.put("/api/recipes/:id/ingredients", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      const { ingredients } = req.body;
      
      if (!Array.isArray(ingredients)) {
        return res.status(400).json({ message: "Ingredients must be an array" });
      }
      
      const updatedIngredients = await storage.updateRecipeIngredients(recipeId, ingredients);
      res.json(updatedIngredients);
    } catch (error) {
      res.status(500).json({ message: "Failed to update recipe ingredients" });
    }
  });
  
  // DASHBOARD ROUTES
  
  // Get dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const ingredients = await storage.getAllIngredients();
      const recipes = await storage.getAllRecipesWithIngredients();
      
      // Count low stock items
      const lowStockCount = ingredients.filter(ingredient => 
        ingredient.minimumStock !== null && ingredient.quantity <= ingredient.minimumStock
      ).length;
      
      // Count expiring items
      const today = new Date();
      const expiringCount = ingredients.filter(ingredient => 
        ingredient.expiryDate && 
        new Date(ingredient.expiryDate) > today && 
        new Date(ingredient.expiryDate) <= addDays(today, 7)
      ).length;
      
      // Generate alerts
      const alerts = [];
      
      // Add expiring soon alerts
      ingredients
        .filter(ingredient => 
          ingredient.expiryDate && 
          new Date(ingredient.expiryDate) > today && 
          new Date(ingredient.expiryDate) <= addDays(today, 3)
        )
        .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
        .slice(0, 3) // Limit to top 3 most urgent
        .forEach(ingredient => {
          const daysLeft = differenceInDays(new Date(ingredient.expiryDate!), today);
          let message;
          
          if (daysLeft === 0) {
            message = `${ingredient.name} expires today`;
          } else if (daysLeft === 1) {
            message = `${ingredient.name} expires tomorrow`;
          } else {
            message = `${ingredient.name} expires in ${daysLeft} days`;
          }
          
          alerts.push({
            type: "danger",
            message
          });
        });
      
      // Add low stock alerts
      ingredients
        .filter(ingredient => 
          ingredient.minimumStock !== null && ingredient.quantity <= ingredient.minimumStock
        )
        .sort((a, b) => {
          // Sort by how much below minimum stock they are (percentage)
          const aPercentage = a.quantity / (a.minimumStock || 1);
          const bPercentage = b.quantity / (b.minimumStock || 1);
          return aPercentage - bPercentage;
        })
        .slice(0, 3) // Limit to top 3 most critical
        .forEach(ingredient => {
          alerts.push({
            type: "warning",
            message: `Low on ${ingredient.name} (${ingredient.quantity}${ingredient.unit} remaining)`
          });
        });
      
      res.json({
        totalIngredients: ingredients.length,
        totalRecipes: recipes.length,
        lowStockCount,
        expiringCount,
        alerts,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve dashboard data" });
    }
  });
  
  // REPORTS ROUTES
  
  // Get reports data
  app.get("/api/reports", async (req, res) => {
    try {
      const ingredients = await storage.getAllIngredients();
      const recipes = await storage.getAllRecipesWithIngredients();
      const today = new Date();
      
      // Get low stock items
      const lowStock = ingredients
        .filter(ingredient => 
          ingredient.minimumStock !== null && ingredient.quantity <= ingredient.minimumStock
        )
        .sort((a, b) => {
          // Sort by ratio of current to minimum (ascending)
          const aRatio = a.quantity / (a.minimumStock || 1);
          const bRatio = b.quantity / (b.minimumStock || 1);
          return aRatio - bRatio;
        });
      
      // Get expiring items
      const expiring = ingredients
        .filter(ingredient => ingredient.expiryDate !== null)
        .map(ingredient => {
          const expiryDate = new Date(ingredient.expiryDate!);
          const daysLeft = differenceInDays(expiryDate, today);
          return { ...ingredient, daysLeft };
        })
        .filter(ingredient => ingredient.daysLeft <= 7)
        .sort((a, b) => a.daysLeft - b.daysLeft);
      
      // Calculate most used ingredients
      const ingredientUsage = new Map();
      
      recipes.forEach(recipe => {
        recipe.ingredients.forEach(ri => {
          const count = ingredientUsage.get(ri.ingredientId) || 0;
          ingredientUsage.set(ri.ingredientId, count + 1);
        });
      });
      
      const mostUsed = ingredients
        .map(ingredient => {
          const recipeCount = ingredientUsage.get(ingredient.id) || 0;
          return { ...ingredient, recipeCount };
        })
        .sort((a, b) => b.recipeCount - a.recipeCount)
        .slice(0, 10); // Top 10 most used
      
      res.json({
        lowStock,
        expiring,
        mostUsed
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve reports data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
