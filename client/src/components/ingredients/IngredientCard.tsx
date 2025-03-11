import { format, isPast, isToday, isTomorrow, addDays } from "date-fns";
import { Ingredient } from "@shared/schema";
import { Pencil, Trash, AlertCircle, CalendarX } from "lucide-react";
import { Link } from "wouter";
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
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface IngredientCardProps {
  ingredient: Ingredient;
}

export default function IngredientCard({ ingredient }: IngredientCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/ingredients/${ingredient.id}`);
      toast({
        title: "Successfully deleted",
        description: `${ingredient.name} has been removed from your inventory.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    } catch (error) {
      toast({
        title: "Error deleting ingredient",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatExpiryDate = (date: Date | null) => {
    if (!date) return "No expiry date";
    
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return `Expired on ${format(date, 'MMM d, yyyy')}`;
    
    return format(date, 'MMM d, yyyy');
  };

  const isLowStock = ingredient.minimumStock !== null && 
    ingredient.quantity <= ingredient.minimumStock;
  
  const isExpiringSoon = ingredient.expiryDate && 
    !isPast(ingredient.expiryDate) && 
    ingredient.expiryDate <= addDays(new Date(), 3);

  const isExpired = ingredient.expiryDate && isPast(ingredient.expiryDate);

  return (
    <div className="border border-slate-200 rounded-md p-3 hover:bg-slate-50">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{ingredient.name}</h4>
          <div className="flex items-center text-sm text-slate-500">
            <span>{ingredient.quantity}{ingredient.unit}</span>
            {(isLowStock || isExpiringSoon || isExpired) && (
              <>
                <span className="mx-1">•</span>
                {isExpired && (
                  <span className="text-danger">
                    <CalendarX className="inline mr-1 h-3 w-3" />
                    Expired
                  </span>
                )}
                {isExpiringSoon && !isExpired && (
                  <span className="text-danger">
                    <CalendarX className="inline mr-1 h-3 w-3" />
                    Expires Soon
                  </span>
                )}
                {isLowStock && !isExpired && !isExpiringSoon && (
                  <span className="text-warning">
                    <AlertCircle className="inline mr-1 h-3 w-3" />
                    Low Stock
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-between items-end">
          <div className="text-sm">
            {ingredient.expiryDate 
              ? formatExpiryDate(new Date(ingredient.expiryDate))
              : "No expiry date"}
          </div>
          <div className="flex mt-2">
            <Link href={`/ingredients/${ingredient.id}/edit`}>
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
                    This will permanently delete {ingredient.name} from your inventory. This action cannot be undone.
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
      </div>
    </div>
  );
}
