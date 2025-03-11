import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeCard from "@/components/recipes/RecipeCard";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function RecipesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("name");

  // Fetch recipes
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["/api/recipes"]
  });

  // Filter, sort, and search recipes
  const filteredRecipes = recipes
    .filter((recipe: any) => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "ready" && recipe.missingIngredients.count === 0) return matchesSearch;
      if (statusFilter === "missing" && recipe.missingIngredients.count > 0) return matchesSearch;
      if (statusFilter === "low" && recipe.missingIngredients.lowStock) return matchesSearch;
      
      return false;
    })
    .sort((a: any, b: any) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "cook-time":
          return a.cookTime - b.cookTime;
        case "ingredients":
          return a.ingredients.length - b.ingredients.length;
        default:
          return 0;
      }
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <Link href="/recipes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Recipe
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipes</SelectItem>
                  <SelectItem value="ready">Ready to Cook</SelectItem>
                  <SelectItem value="missing">Missing Ingredients</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="cook-time">Cook Time</SelectItem>
                  <SelectItem value="ingredients">Number of Ingredients</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          {isLoading ? (
            // Loading state
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="border border-slate-200 rounded-md overflow-hidden flex flex-col sm:flex-row">
                  <div className="w-full sm:w-24 h-20 sm:h-auto bg-slate-200">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="p-3 flex-1">
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-5 w-32" />
                      <div className="flex">
                        <Skeleton className="h-5 w-5 mr-3" />
                        <Skeleton className="h-5 w-5" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-40 mb-4" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="space-y-3">
              {filteredRecipes.map((recipe: any) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  missingIngredients={recipe.missingIngredients}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-lg text-slate-500">No recipes found</p>
              {searchTerm || statusFilter !== "all" ? (
                <p className="text-sm text-slate-400">Try changing your search or filter criteria</p>
              ) : (
                <div className="mt-4">
                  <Link href="/recipes/new">
                    <Button>Add your first recipe</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
