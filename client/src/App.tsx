import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Dashboard from "@/pages/dashboard";
import IngredientsList from "@/pages/ingredients/index";
import NewIngredient from "@/pages/ingredients/new";
import EditIngredient from "@/pages/ingredients/edit";
import RecipesList from "@/pages/recipes/index";
import NewRecipe from "@/pages/recipes/new";
import EditRecipe from "@/pages/recipes/edit";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/ingredients" component={IngredientsList} />
      <Route path="/ingredients/new" component={NewIngredient} />
      <Route path="/ingredients/:id/edit" component={EditIngredient} />
      <Route path="/recipes" component={RecipesList} />
      <Route path="/recipes/new" component={NewRecipe} />
      <Route path="/recipes/:id/edit" component={EditRecipe} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
