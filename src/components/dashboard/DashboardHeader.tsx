
import { Button } from "@/components/ui/button";
import { Store, Plus, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardHeader = () => {
  return (
    <div className="relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-2xl sm:rounded-3xl blur-3xl" />
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-background via-background to-muted/20 rounded-2xl sm:rounded-3xl border border-border/50 shadow-xl backdrop-blur-sm w-full">
        <div className="space-y-2 sm:space-y-3 w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-muted-foreground font-medium flex items-center gap-2">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-500 animate-pulse" />
            <span className="hidden sm:inline">Bienvenue sur votre espace de gestion</span>
            <span className="sm:hidden">Bienvenue</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
          <Button variant="outline" size="sm" asChild className="group border-2 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 hover:scale-105 text-xs sm:text-sm w-full sm:w-auto">
            <Link to="/store-config">
              <Store className="mr-1 sm:mr-2 lg:mr-3 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 group-hover:text-blue-600 transition-colors" />
              <span className="hidden sm:inline">Configurer ma boutique</span>
              <span className="sm:hidden">Configurer</span>
            </Link>
          </Button>
          <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 text-xs sm:text-sm w-full sm:w-auto">
            <Link to="/products">
              <Plus className="mr-1 sm:mr-2 lg:mr-3 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Ajouter un produit</span>
              <span className="sm:hidden">Ajouter</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
