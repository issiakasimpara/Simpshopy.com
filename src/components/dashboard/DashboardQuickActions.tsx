
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardQuickActions = () => {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
      
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" size="default" className="w-full justify-start group hover:bg-purple-50 dark:hover:bg-purple-950/30 border-2 hover:border-purple-500/50 transition-all duration-300 p-4" asChild>
          <Link to="/products">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 rounded-lg mr-3">
              <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            Gérer les produits
            <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        <Button variant="outline" size="default" className="w-full justify-start group hover:bg-blue-50 dark:hover:bg-blue-950/30 border-2 hover:border-blue-500/50 transition-all duration-300 p-4" asChild>
          <Link to="/orders">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-lg mr-3">
              <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Voir les commandes
            <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        <Button variant="outline" size="default" className="w-full justify-start group hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-2 hover:border-emerald-500/50 transition-all duration-300 p-4" asChild>
          <Link to="/analytics">
            <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 rounded-lg mr-3">
              <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Analyses détaillées
            <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
