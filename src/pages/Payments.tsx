
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  CreditCard,
  Banknote,
  Wallet,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/hooks/useStores";
import { useToast } from "@/hooks/use-toast";


const Payments = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const { store } = useStores();
  const { toast } = useToast();

  // Données simulées pour l'instant
  const stats = {
    total_revenue: 0,
    total_orders: 0,
    average_order_value: 0,
    conversion_rate: 0,
    today_revenue: 0,
    today_orders: 0,
    week_revenue: 0,
    week_orders: 0,
    month_revenue: 0,
    month_orders: 0
  };

  const transactions: any[] = [];
  const withdrawals: any[] = [];

  const refreshData = async () => {
    setRefreshing(true);
    setTimeout(() => {
      toast({
        title: "Succès",
        description: "Données mises à jour",
      });
      setRefreshing(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getWithdrawalStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleRequestWithdrawal = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "La demande de retrait sera bientôt disponible",
    });
  };

  const handleExport = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "L'export des données sera bientôt disponible",
    });
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!store) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune boutique trouvée</h3>
          <p className="text-gray-500">Vous devez créer une boutique pour accéder aux paiements.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paiements & Revenus</h1>
            <p className="text-gray-600 mt-1">Gérez vos revenus et demandez des retraits</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExport}
              disabled={refreshing}
            >
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            <Button 
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              onClick={handleRequestWithdrawal}
              disabled={refreshing}
            >
              <Wallet className="w-4 h-4" />
              Demander un retrait
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.total_revenue || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.total_revenue ? '+0% par rapport au mois dernier' : 'Aucun revenu pour le moment'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.total_orders ? '+0% par rapport au mois dernier' : 'Aucune commande pour le moment'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.average_order_value || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.average_order_value ? '+0% par rapport au mois dernier' : 'Aucune donnée disponible'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.conversion_rate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.conversion_rate ? '+0% par rapport au mois dernier' : 'Aucune donnée disponible'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                              <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                      <TabsTrigger value="transactions">Transactions</TabsTrigger>
                      <TabsTrigger value="withdrawals">Retraits</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="test">Test Moneroo</TabsTrigger>
                    </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Revenus par période */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aujourd'hui</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.today_revenue || 0)}</div>
                  <p className="text-sm text-gray-600">{stats?.today_orders || 0} commandes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cette semaine</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.week_revenue || 0)}</div>
                  <p className="text-sm text-gray-600">{stats?.week_orders || 0} commandes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ce mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats?.month_revenue || 0)}</div>
                  <p className="text-sm text-gray-600">{stats?.month_orders || 0} commandes</p>
                </CardContent>
              </Card>
            </div>

            {/* Graphique simple (placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune donnée disponible pour le moment</p>
                    <p className="text-sm text-gray-400">Les graphiques apparaîtront une fois que vous aurez des transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transactions récentes</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={refreshData}
                      disabled={refreshing}
                    >
                      <Filter className="w-4 h-4" />
                      {refreshing ? 'Actualisation...' : 'Actualiser'}
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Rechercher
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction</h3>
                    <p className="text-gray-500">Vous n'avez pas encore de transactions. Elles apparaîtront ici une fois que vos clients commenceront à acheter.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.customer_name}</p>
                            <p className="text-sm text-gray-600">{transaction.product_name || 'Produit non spécifié'}</p>
                            <p className="text-xs text-gray-500">Commande {transaction.order_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(transaction.amount)}</p>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status === 'completed' ? 'Complété' : 
                             transaction.status === 'pending' ? 'En attente' :
                             transaction.status === 'failed' ? 'Échoué' : 'Remboursé'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.transaction_date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Demandes de retrait</CardTitle>
                  <Button 
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                    onClick={handleRequestWithdrawal}
                    disabled={refreshing}
                  >
                    Nouvelle demande
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande de retrait</h3>
                    <p className="text-gray-500">Vous n'avez pas encore demandé de retrait. Cliquez sur "Nouvelle demande" pour commencer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{formatCurrency(withdrawal.amount)}</p>
                          <p className="text-sm text-gray-600">{withdrawal.bank_account}</p>
                          <p className="text-xs text-gray-500">Demandé le {formatDate(withdrawal.requested_at)}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getWithdrawalStatusColor(withdrawal.status)}>
                            {withdrawal.status === 'completed' ? 'Complété' :
                             withdrawal.status === 'pending' ? 'En attente' :
                             withdrawal.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                          </Badge>
                          {withdrawal.processed_at && (
                            <p className="text-xs text-gray-500 mt-1">Traité le {formatDate(withdrawal.processed_at)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Méthodes de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune donnée disponible</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Orange Money</span>
                        <span className="font-medium">45%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">MTN MoMo</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Wave</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Autres</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance par jour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune donnée disponible</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🧪 Test Moneroo</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Intégration Moneroo à implémenter...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
