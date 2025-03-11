import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import IngredientCard from "@/components/ingredients/IngredientCard";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { INGREDIENT_CATEGORIES, CATEGORY_LABELS } from "@shared/schema";

export default function IngredientsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("name");

  // Fetch ingredients
  const { data: ingredients = [], isLoading } = useQuery({
    queryKey: ["/api/ingredients"]
  });

  // Filter, sort, and search ingredients
  const filteredIngredients = ingredients
    .filter((ingredient: any) => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || ingredient.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "expiry":
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        case "quantity-asc":
          return a.quantity - b.quantity;
        case "quantity-desc":
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ingredients</h1>
        <Link href="/ingredients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Ingredient
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>

            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {INGREDIENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="expiry">Expiry Date</SelectItem>
                  <SelectItem value="quantity-asc">Quantity (Low to High)</SelectItem>
                  <SelectItem value="quantity-desc">Quantity (High to Low)</SelectItem>
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
                <div key={i} className="border border-slate-200 rounded-md p-3">
                  <div className="flex justify-between">
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex flex-col items-end">
                      <Skeleton className="h-4 w-24 mb-3" />
                      <div className="flex">
                        <Skeleton className="h-5 w-5 mr-3" />
                        <Skeleton className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredIngredients.length > 0 ? (
            <div className="space-y-3">
              {filteredIngredients.map((ingredient: any) => (
                <IngredientCard key={ingredient.id} ingredient={ingredient} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-lg text-slate-500">No ingredients found</p>
              {searchTerm || categoryFilter !== "all" ? (
                <p className="text-sm text-slate-400">Try changing your search or filter criteria</p>
              ) : (
                <div className="mt-4">
                  <Link href="/ingredients/new">
                    <Button>Add your first ingredient</Button>
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
