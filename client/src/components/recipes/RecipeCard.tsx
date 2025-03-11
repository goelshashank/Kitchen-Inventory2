import { Link } from "wouter";
import { Pencil, Trash } from "lucide-react";
import { RecipeWithIngredients } from "@shared/schema";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RecipeCardProps {
  recipe: RecipeWithIngredients;
  missingIngredients: {count: number, lowStock: boolean};
}

export default function RecipeCard({ recipe, missingIngredients }: RecipeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/recipes/${recipe.id}`);
      toast({
        title: "Successfully deleted",
        description: `${recipe.name} has been removed from your recipes.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    } catch (error) {
      toast({
        title: "Error deleting recipe",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to determine status badge styling
  const getStatusBadge = () => {
    if (missingIngredients.count === 0) {
      return {
        bg: "bg-success bg-opacity-10",
        text: "text-success",
        message: "Ready to Cook"
      };
    } else if (missingIngredients.lowStock && missingIngredients.count === 0) {
      return {
        bg: "bg-warning bg-opacity-10",
        text: "text-warning",
        message: "Low on ingredients"
      };
    } else if (missingIngredients.count === 1) {
      return {
        bg: "bg-warning bg-opacity-10",
        text: "text-warning",
        message: "Missing 1 ingredient"
      };
    } else {
      return {
        bg: "bg-danger bg-opacity-10",
        text: "text-danger",
        message: `Missing ${missingIngredients.count} ingredients`
      };
    }
  };

  const status = getStatusBadge();
  
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden flex flex-col sm:flex-row">
      <div className="w-full sm:w-24 h-20 sm:h-auto bg-slate-200 flex items-center justify-center">
        {recipe.image ? (
          <img 
            src={recipe.image} 
            alt={recipe.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="text-slate-400 flex items-center justify-center h-full w-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between">
            <h4 className="font-medium">{recipe.name}</h4>
            <div className="flex">
              <Link href={`/recipes/${recipe.id}/edit`}>
                <button className="text-slate-400 hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="ml-3 text-slate-400 hover:text-danger">
                    <Trash className="h-4 w-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {recipe.name} from your recipes. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete} 
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {recipe.cookTime} min • {recipe.ingredients.length} ingredients
          </p>
        </div>
        <div className="flex items-center mt-2">
          <span className={`${status.bg} ${status.text} text-xs py-1 px-2 rounded-full`}>
            {status.message}
          </span>
        </div>
      </div>
    </div>
  );
}
