import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, primaryKey, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Constants for ingredient categories and units
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

// Database tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull().$type<typeof UNITS[number]>(),
  category: text("category").notNull().$type<typeof INGREDIENT_CATEGORIES[number]>(),
  expiryDate: timestamp("expiry_date"),
  minimumStock: real("minimum_stock"),
  skuQuantity: real("sku_quantity"),
  skuCost: real("sku_cost"),
  notes: text("notes"),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cookTime: integer("cook_time").notNull(), // in minutes
  instructions: text("instructions").notNull(),
  image: text("image"),
  notes: text("notes"),
});

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

// Table relations
export const usersRelations = relations(users, ({ many }) => ({
  ingredients: many(ingredients),
  recipes: many(recipes),
}));

export const ingredientsRelations = relations(ingredients, ({ many, one }) => ({
  recipeIngredients: many(recipeIngredients),
  user: one(users, {
    fields: [ingredients.userId],
    references: [users.id],
  }),
}));

export const recipesRelations = relations(recipes, ({ many, one }) => ({
  recipeIngredients: many(recipeIngredients),
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id]
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id]
  })
}));

// Insert schemas
export const insertIngredientSchema = createInsertSchema(ingredients)
  .omit({
    id: true,
    userId: true,
  });

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  userId: true,
});

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients);

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertRecipeIngredient = z.infer<typeof insertRecipeIngredientSchema>;

export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & { ingredient: Ingredient })[];
};

// UI display mappings
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