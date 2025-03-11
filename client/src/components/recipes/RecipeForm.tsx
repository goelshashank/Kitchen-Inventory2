import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertRecipeSchema, RecipeWithIngredients, UNITS, UNIT_LABELS } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trash, Plus } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface RecipeFormProps {
  recipe?: RecipeWithIngredients;
  mode: "create" | "edit";
}

// Extend the recipe schema for validation
const validationSchema = insertRecipeSchema.extend({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  cookTime: z.coerce.number().int().positive({
    message: "Cook time must be a positive number."
  }),
  instructions: z.string().min(10, {
    message: "Instructions should be at least 10 characters."
  }),
  image: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  recipeIngredients: z.array(
    z.object({
      ingredientId: z.coerce.number(),
      quantity: z.coerce.number().positive({
        message: "Quantity must be greater than 0."
      }),
      unit: z.string(),
    })
  ),
});

type FormValues = z.infer<typeof validationSchema>;

export default function RecipeForm({ recipe, mode }: RecipeFormProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch all ingredients for the ingredient selector
  const { data: ingredients = [] } = useQuery({ 
    queryKey: ["/api/ingredients"] 
  });

  // Prepare recipe ingredients for the form
  const defaultRecipeIngredients = recipe?.ingredients.map(ri => ({
    ingredientId: ri.ingredientId,
    quantity: ri.quantity,
    unit: ri.unit
  })) || [];

  // Initialize form with default values or existing recipe values
  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: recipe?.name || "",
      cookTime: recipe?.cookTime || 30,
      instructions: recipe?.instructions || "",
      image: recipe?.image || "",
      notes: recipe?.notes || "",
      recipeIngredients: defaultRecipeIngredients.length > 0 
        ? defaultRecipeIngredients 
        : [{ ingredientId: 0, quantity: 1, unit: "g" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "recipeIngredients",
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: FormValues) => {
    try {
      // Extract recipeIngredients for separate handling
      const { recipeIngredients, ...recipeData } = data;
      
      if (mode === "create") {
        // Create new recipe
        const response = await apiRequest("POST", "/api/recipes", recipeData);
        const newRecipe = await response.json();
        
        // Add recipe ingredients
        if (recipeIngredients.length > 0) {
          await apiRequest("POST", `/api/recipes/${newRecipe.id}/ingredients`, {
            ingredients: recipeIngredients
          });
        }
        
        toast({
          title: "Success",
          description: "Recipe has been created successfully",
        });
      } else if (recipe) {
        // Update recipe
        await apiRequest("PATCH", `/api/recipes/${recipe.id}`, recipeData);
        
        // Update recipe ingredients
        await apiRequest("PUT", `/api/recipes/${recipe.id}/ingredients`, {
          ingredients: recipeIngredients
        });
        
        toast({
          title: "Success",
          description: "Recipe has been updated successfully",
        });
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      navigate("/recipes");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Recipe" : "Edit Recipe"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter recipe name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cookTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <Label className="block mb-2">Ingredients</Label>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name={`recipeIngredients.${index}.ingredientId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index > 0 ? "sr-only" : ""}>Ingredient</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ingredient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ingredients.map((ingredient: any) => (
                                <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                                  {ingredient.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`recipeIngredients.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel className={index > 0 ? "sr-only" : ""}>Qty</FormLabel>
                          <FormControl>
                            <Input type="number" min="0.01" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`recipeIngredients.${index}.unit`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel className={index > 0 ? "sr-only" : ""}>Unit</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UNITS.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      className={`${index === 0 && fields.length === 1 ? 'invisible' : ''}`}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ ingredientId: 0, quantity: 1, unit: "g" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Ingredient
              </Button>
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter step-by-step instructions" 
                      rows={6}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any additional notes" 
                      rows={3}
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate("/recipes")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Recipe"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
