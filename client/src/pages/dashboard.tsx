import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Carrot, Book, AlertTriangle, CalendarX, Plus, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/dashboard/StatCard";
import AlertCard from "@/components/dashboard/AlertCard";
import IngredientCard from "@/components/ingredients/IngredientCard";
import RecipeCard from "@/components/recipes/RecipeCard";
import { useState } from "react";

export default function Dashboard() {
  // Local state for search
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"]
  });

  // Fetch ingredients
  const { data: ingredients = [], isLoading: ingredientsLoading } = useQuery({
    queryKey: ["/api/ingredients"]
  });

  // Fetch recipes
  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ["/api/recipes"]
  });

  // Filter ingredients by search term
  const filteredIngredients = ingredients
    .filter((ingredient: any) => 
      ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
    )
    .slice(0, 4); // Limit to 4 items for the dashboard view

  // Filter recipes by search term
  const filteredRecipes = recipes
    .filter((recipe: any) => 
      recipe.name.toLowerCase().includes(recipeSearch.toLowerCase())
    )
    .slice(0, 4); // Limit to 4 items for the dashboard view

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-6">Kitchen Dashboard</h2>
      
      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardLoading ? (
          // Skeleton loaders for stats
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard 
              title="Total Ingredients" 
              value={dashboardData?.totalIngredients || 0} 
              icon={<Carrot className="text-primary" />}
              borderColor="border-primary"
              iconBgColor="bg-primary"
            />
            <StatCard 
              title="Total Recipes" 
              value={dashboardData?.totalRecipes || 0} 
              icon={<Book className="text-secondary" />}
              borderColor="border-secondary"
              iconBgColor="bg-secondary"
            />
            <StatCard 
              title="Low Stock Items" 
              value={dashboardData?.lowStockCount || 0} 
              icon={<AlertTriangle className="text-warning" />}
              borderColor="border-warning"
              iconBgColor="bg-warning"
            />
            <StatCard 
              title="Expiring Soon" 
              value={dashboardData?.expiringCount || 0} 
              icon={<CalendarX className="text-danger" />}
              borderColor="border-danger"
              iconBgColor="bg-danger"
            />
          </>
        )}
      </div>
      
      {/* Alerts Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold">Recent Alerts</h3>
        </div>
        <div className="p-4">
          {dashboardLoading ? (
            // Skeleton loaders for alerts
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full mb-2" />
            ))
          ) : dashboardData?.alerts && dashboardData.alerts.length > 0 ? (
            dashboardData.alerts.map((alert: any, index: number) => (
              <AlertCard 
                key={index} 
                type={alert.type} 
                message={alert.message} 
              />
            ))
          ) : (
            <p className="text-slate-500">No alerts at this time. Everything looks good!</p>
          )}
        </div>
      </div>
      
      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold">Ingredients</h3>
            <Link href="/ingredients/new">
              <Button size="sm" className="h-8">
                <Plus className="mr-1 h-4 w-4" /> Add New
              </Button>
            </Link>
          </div>
          <div className="p-4">
            <div className="flex mb-3">
              <div className="relative flex-1">
                <Input
                  placeholder="Search ingredients"
                  className="pl-9"
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
              <Button variant="outline" className="ml-2 px-2">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ingredientsLoading ? (
                // Skeleton loaders for ingredients
                Array(4).fill(0).map((_, i) => (
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
                ))
              ) : filteredIngredients.length > 0 ? (
                filteredIngredients.map((ingredient: any) => (
                  <IngredientCard key={ingredient.id} ingredient={ingredient} />
                ))
              ) : (
                <p className="text-slate-500 py-2">No ingredients found. Add some to get started!</p>
              )}
            </div>
            
            <Link href="/ingredients">
              <Button variant="outline" className="mt-4 w-full text-primary border-primary hover:bg-primary hover:text-white">
                View All Ingredients
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Recipes Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold">Recipes</h3>
            <Link href="/recipes/new">
              <Button size="sm" className="h-8">
                <Plus className="mr-1 h-4 w-4" /> Add New
              </Button>
            </Link>
          </div>
          <div className="p-4">
            <div className="flex mb-3">
              <div className="relative flex-1">
                <Input
                  placeholder="Search recipes"
                  className="pl-9"
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
              <Button variant="outline" className="ml-2 px-2">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recipesLoading ? (
                // Skeleton loaders for recipes
                Array(4).fill(0).map((_, i) => (
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
                ))
              ) : filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe: any) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    missingIngredients={recipe.missingIngredients || { count: 0, lowStock: false }}
                  />
                ))
              ) : (
                <p className="text-slate-500 py-2">No recipes found. Add some to get started!</p>
              )}
            </div>
            
            <Link href="/recipes">
              <Button variant="outline" className="mt-4 w-full text-primary border-primary hover:bg-primary hover:text-white">
                View All Recipes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
