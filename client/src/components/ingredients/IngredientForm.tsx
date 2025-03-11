import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { INGREDIENT_CATEGORIES, CATEGORY_LABELS, UNITS, UNIT_LABELS, insertIngredientSchema, Ingredient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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

interface IngredientFormProps {
  ingredient?: Ingredient;
  mode: "create" | "edit";
}

// Add validation to schema
const validationSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  quantity: z.coerce.number().positive({
    message: "Quantity must be greater than 0."
  }),
  unit: z.enum(UNITS),
  category: z.enum(INGREDIENT_CATEGORIES),
  expiryDate: z.string().optional().transform(val => val ? val : null),
  minimumStock: z.coerce.number().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export default function IngredientForm({ ingredient, mode }: IngredientFormProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Initialize form with default values or existing ingredient values
  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: ingredient?.name || "",
      quantity: ingredient?.quantity || 0,
      unit: ingredient?.unit || "g",
      category: ingredient?.category || "other",
      expiryDate: ingredient?.expiryDate ? new Date(ingredient.expiryDate).toISOString().split('T')[0] : "",
      minimumStock: ingredient?.minimumStock || 0,
      notes: ingredient?.notes || "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof validationSchema>) => {
    try {
      if (mode === "create") {
        await apiRequest("POST", "/api/ingredients", data);
        toast({
          title: "Success",
          description: "Ingredient has been created successfully",
        });
      } else {
        await apiRequest("PATCH", `/api/ingredients/${ingredient?.id}`, data);
        toast({
          title: "Success",
          description: "Ingredient has been updated successfully",
        });
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      navigate("/ingredients");
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
        <CardTitle>{mode === "create" ? "Add New Ingredient" : "Edit Ingredient"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ingredient name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {UNIT_LABELS[unit]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INGREDIENT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {CATEGORY_LABELS[category]}
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
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minimumStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Stock Level</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">Set this to receive low stock alerts</p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional notes here" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate("/ingredients")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Ingredient"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
