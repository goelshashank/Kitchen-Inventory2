import { pgTable, serial, text, real, timestamp, integer, foreignKey, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const ingredients = pgTable("ingredients", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	quantity: real().notNull(),
	unit: text().notNull(),
	category: text().notNull(),
	expiryDate: timestamp("expiry_date", { mode: 'string' }),
	minimumStock: real("minimum_stock"),
	notes: text(),
});

export const recipes = pgTable("recipes", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	cookTime: integer("cook_time").notNull(),
	instructions: text().notNull(),
	image: text(),
	notes: text(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
	recipeId: integer("recipe_id").notNull(),
	ingredientId: integer("ingredient_id").notNull(),
	quantity: real().notNull(),
	unit: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "recipe_ingredients_recipe_id_recipes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ingredientId],
			foreignColumns: [ingredients.id],
			name: "recipe_ingredients_ingredient_id_ingredients_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.recipeId, table.ingredientId], name: "recipe_ingredients_recipe_id_ingredient_id_pk"}),
]);
