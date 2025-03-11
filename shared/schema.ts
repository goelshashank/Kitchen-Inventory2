import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, primaryKey, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categories for ingredients
export const INGREDIENT_CATEGORIES = [
  "dairy",
  "produce",
  "meat",
  "seafood",
  "bakery",
  "dry_goods",
  "canned",
  "frozen",
  "spices",
  "other"
] as const;

// Units for measurement
export const UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "pcs",
  "oz",
  "lb"
] as const;

// Ingredients table
export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull().$type<typeof UNITS[number]>(),
  category: text("category").notNull().$type<typeof INGREDIENT_CATEGORIES[number]>(),
  expiryDate: timestamp("expiry_date"),
  minimumStock: real("minimum_stock"),
  notes: text("notes"),
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
});

// Recipes table
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cookTime: integer("cook_time").notNull(), // in minutes
  instructions: text("instructions").notNull(),
  image: text("image"),
  notes: text("notes"),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

// Many-to-many relationship between recipes and ingredients with quantities
export const recipeIngredients = pgTable("recipe_ingredients", {
  recipeId: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  ingredientId: integer("ingredient_id").notNull().references(() => ingredients.id, { onDelete: "cascade" }),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull().$type<typeof UNITS[number]>(),
}, (table) => {
  return {
    pk: primaryKey(table.recipeId, table.ingredientId),
  };
});

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients);

// Type definitions
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertRecipeIngredient = z.infer<typeof insertRecipeIngredientSchema>;

// Extended Recipe with ingredients
export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & { ingredient: Ingredient })[];
};

// Category label mapping for UI display
export const CATEGORY_LABELS: Record<typeof INGREDIENT_CATEGORIES[number], string> = {
  dairy: "Dairy",
  produce: "Produce",
  meat: "Meat",
  seafood: "Seafood",
  bakery: "Bakery",
  dry_goods: "Dry Goods",
  canned: "Canned Goods",
  frozen: "Frozen Foods",
  spices: "Spices",
  other: "Other"
};

// Unit label mapping for UI display
export const UNIT_LABELS: Record<typeof UNITS[number], string> = {
  g: "grams (g)",
  kg: "kilograms (kg)",
  ml: "milliliters (ml)",
  l: "liters (l)",
  tsp: "teaspoons (tsp)",
  tbsp: "tablespoons (tbsp)",
  cup: "cups",
  pcs: "pieces",
  oz: "ounces (oz)",
  lb: "pounds (lb)"
};
