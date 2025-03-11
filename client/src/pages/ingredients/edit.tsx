import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import IngredientForm from "@/components/ingredients/IngredientForm";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function EditIngredient() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch ingredient data
  const { data: ingredient, isLoading, error } = useQuery({
    queryKey: [`/api/ingredients/${id}`],
  });

  // Handle error state
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Could not find the ingredient you're looking for",
        variant: "destructive",
      });
      navigate("/ingredients");
    }
  }, [error, navigate, toast]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Ingredient</h1>
      
      {isLoading ? (
        <Card className="w-full max-w-2xl mx-auto p-6">
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </Card>
      ) : ingredient ? (
        <IngredientForm ingredient={ingredient} mode="edit" />
      ) : null}
    </div>
  );
}
