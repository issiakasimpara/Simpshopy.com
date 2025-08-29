import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gift, 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Users,
  TrendingUp,
  Target,
  Settings,
  Bell,
  Mail,
  Smartphone,
  Globe
} from "lucide-react";

const PopupsReductions = () => {
  const [activeTab, setActiveTab] = useState("popups");

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header avec gradient moderne */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600/5 via-pink-600/5 to-purple-600/5 rounded-3xl" />
          <div className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20 rounded-3xl border border-border/50 shadow-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 rounded-xl shadow-md">
                    <Gift className="h-5 w-5 sm:h-7 sm:w-7 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 dark:from-rose-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Popups et Reductions
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-medium">
                      Gérez vos popups promotionnels et codes de réduction
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <Button variant="outline" className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200/50 dark:border-rose-800/30 hover:bg-gradient-to-r hover:from-rose-100 hover:to-pink-100 transition-all duration-300">
                  <Eye className="mr-2 h-4 w-4" />
                  Aperçu
                </Button>
                <Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Créer
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats avec design modernisé */}
        <div className="bg-gradient-to-br from-background via-background to-muted/10 rounded-2xl border border-border/50 shadow-lg p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-background via-background to-muted/10">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 opacity-60" />
              
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-rose-600 transition-colors">
                  Popups actifs
                </CardTitle>
                <div className="p-2 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <Gift className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground">3</div>
                <p className="text-xs text-muted-foreground">
                  +12% ce mois
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-background via-background to-muted/10">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-60" />
              
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-green-600 transition-colors">
                  Codes actifs
                </CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <Tag className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground">8</div>
                <p className="text-xs text-muted-foreground">
                  +5% ce mois
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-background via-background to-muted/10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
              
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-blue-600 transition-colors">
                  Conversions
                </CardTitle>
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground">24.5%</div>
                <p className="text-xs text-muted-foreground">
                  +8% ce mois
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-background via-background to-muted/10">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 opacity-60" />
              
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-orange-600 transition-colors">
                  Revenus générés
                </CardTitle>
                <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground">€2,847</div>
                <p className="text-xs text-muted-foreground">
                  +15% ce mois
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contenu principal avec onglets */}
        <div className="bg-gradient-to-br from-background via-background to-muted/10 rounded-2xl border border-border/50 shadow-lg p-3 sm:p-4 lg:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="popups" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Gift className="mr-2 h-4 w-4" />
                Popups
              </TabsTrigger>
              <TabsTrigger 
                value="reductions" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Tag className="mr-2 h-4 w-4" />
                Reductions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popups" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Popup 1 */}
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-muted/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Popup de bienvenue</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Actif
                        </Badge>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <CardDescription>
                      Offre 10% de réduction pour les nouveaux visiteurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Affichage :</span>
                      <span className="font-medium">Après 30 secondes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Conversions :</span>
                      <span className="font-medium text-green-600">156</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <Edit className="mr-1 h-3 w-3" />
                        Modifier
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        Aperçu
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Popup 2 */}
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-muted/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Popup d'abandon</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Actif
                        </Badge>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <CardDescription>
                      Récupération de panier abandonné
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Affichage :</span>
                      <span className="font-medium">Sortie de page</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Conversions :</span>
                      <span className="font-medium text-green-600">89</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <Edit className="mr-1 h-3 w-3" />
                        Modifier
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        Aperçu
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reductions" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Code de réduction 1 */}
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-muted/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">WELCOME10</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Actif
                        </Badge>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <CardDescription>
                      10% de réduction pour les nouveaux clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Réduction :</span>
                      <span className="font-medium text-green-600">10%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Utilisations :</span>
                      <span className="font-medium">247 / 500</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expire le :</span>
                      <span className="font-medium">31/12/2024</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <Edit className="mr-1 h-3 w-3" />
                        Modifier
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        Détails
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Code de réduction 2 */}
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-muted/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">FLASH25</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          Flash
                        </Badge>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <CardDescription>
                      Offre flash 25% de réduction
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Réduction :</span>
                      <span className="font-medium text-green-600">25%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Utilisations :</span>
                      <span className="font-medium">89 / 100</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expire le :</span>
                      <span className="font-medium">Aujourd'hui</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <Edit className="mr-1 h-3 w-3" />
                        Modifier
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        Détails
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PopupsReductions;
