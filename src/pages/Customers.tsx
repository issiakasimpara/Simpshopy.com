
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Plus,
  ShoppingCart,
  Filter,
  Download,
  Package,
  Store,
  UserCheck,
  TrendingUp,
  Star,
  Loader2,
  Mail,
  Phone,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useCustomers } from "@/hooks/useCustomers";
import { formatCurrency } from "@/utils/orderUtils";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const { customers, stats, isLoading, isLoadingStats } = useCustomers();

  // Filtrer les clients selon le terme de recherche
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  return (
    <DashboardLayout>
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Header avec gradient moderne */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-blue-600/5 to-purple-600/5 rounded-2xl sm:rounded-3xl" />
          <div className="relative p-3 sm:p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-background via-background to-muted/20 rounded-2xl sm:rounded-3xl border border-border/50 shadow-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  Gestion des clients
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                  Gérez votre base de clients, suivez leurs achats et analysez leur comportement pour optimiser vos ventes.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                <Input
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 text-sm sm:text-base"
                />
                <Button 
                  onClick={() => setShowCreateCustomer(true)}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau client
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {isLoadingStats ? (
            // Loading state pour les stats
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4">
                  <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent className="px-3 sm:px-4">
                  <div className="h-6 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : stats && Object.entries(stats).length > 0 ? (
            Object.entries(stats).map(([key, value]) => (
              <Card key={key} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4">
                  <CardTitle className="text-xs sm:text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">
                    {key === 'totalCustomers' && <Users className="h-4 w-4" />}
                    {key === 'activeCustomers' && <TrendingUp className="h-4 w-4" />}
                    {key === 'totalRevenue' && <DollarSign className="h-4 w-4" />}
                    {key === 'averageOrderValue' && <ShoppingCart className="h-4 w-4" />}
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-4">
                  <div className="text-lg sm:text-2xl font-bold">
                    {key.includes('Revenue') || key.includes('Value') 
                      ? formatCurrency(value) 
                      : value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Fallback si pas de stats
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Aucune statistique disponible
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Table des clients - Pleine largeur sur mobile, 2/3 sur desktop */}
          <div className="xl:col-span-2">
            <div className="bg-gradient-to-br from-background via-background to-muted/10 rounded-xl sm:rounded-2xl border border-border/50 shadow-lg p-3 sm:p-4 lg:p-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Liste des clients</h2>
                <p className="text-sm text-muted-foreground">Gérez vos clients et leurs informations</p>
              </div>

              {isLoading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">Chargement des clients...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="p-3 sm:p-4 bg-blue-100 dark:bg-blue-900/20 rounded-2xl w-fit mx-auto mb-4 sm:mb-6">
                    <Users className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">
                    Aucun client trouvé
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    Commencez par ajouter votre premier client.
                  </p>
                  <Button onClick={() => setShowCreateCustomer(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un client
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Client</TableHead>
                        <TableHead className="text-xs sm:text-sm">Contact</TableHead>
                        <TableHead className="text-xs sm:text-sm">Commandes</TableHead>
                        <TableHead className="text-xs sm:text-sm">Total dépensé</TableHead>
                        <TableHead className="text-xs sm:text-sm">Statut</TableHead>
                        <TableHead className="text-xs sm:text-sm">Dernière commande</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm sm:text-base font-medium truncate">{customer.name}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">{customer.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs sm:text-sm">
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                <span className="text-muted-foreground truncate">{customer.email}</span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground truncate">{customer.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm">
                              {customer.totalOrders} commande{customer.totalOrders > 1 ? 's' : ''}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600 text-sm sm:text-base">
                              {formatCurrency(customer.totalSpent)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={customer.status === 'active' ? 'default' : 'secondary'}
                              className={customer.status === 'active'
                                ? 'bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm'
                                : 'bg-gray-100 text-gray-800 border-gray-200 text-xs sm:text-sm'
                              }
                            >
                              {customer.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(customer.lastOrderDate).toLocaleDateString('fr-FR')}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar avec détails client et commandes récentes - Cachée sur mobile, visible sur desktop */}
          <div className="hidden xl:block space-y-4 sm:space-y-6">
            {/* Profil client */}
            <div className="bg-gradient-to-br from-background via-background to-muted/10 rounded-xl sm:rounded-2xl border border-border/50 shadow-lg p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Profil client</h3>
                <p className="text-muted-foreground text-sm">Informations détaillées du client sélectionné</p>
              </div>
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
                </div>
                <p className="text-muted-foreground text-center text-sm">
                  Sélectionnez un client pour voir son profil
                </p>
              </div>
            </div>

            {/* Commandes récentes */}
            <div className="bg-gradient-to-br from-background via-background to-muted/10 rounded-xl sm:rounded-2xl border border-border/50 shadow-lg p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Commandes récentes</h3>
                <p className="text-muted-foreground text-sm">Dernières commandes de tous les clients</p>
              </div>
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 rounded-xl shadow-md mb-4">
                  <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-muted-foreground text-center text-sm mb-4">
                  Aucune commande pour le moment
                </p>
                <Button variant="outline" size="sm" asChild className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border-emerald-200/50 dark:border-emerald-800/30 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-blue-100 transition-all duration-300 text-xs sm:text-sm">
                  <Link to="/orders">
                    Voir toutes les commandes
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Customers;
