import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useStores } from '@/hooks/useStores'
import { useToast } from '@/hooks/use-toast'
import { mailchimpService } from '@/services/mailchimpService'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Mail, 
  BarChart3, 
  ExternalLink, 
  RefreshCw, 
  Loader2,
  TrendingUp,
  Eye,
  MousePointer
} from 'lucide-react'

interface MailchimpDashboardProps {
  integration: any
}

const MailchimpDashboard = ({ integration }: MailchimpDashboardProps) => {
  const { user } = useAuth()
  const { store } = useStores()
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (user && store) {
      loadAnalytics()
    }
  }, [user, store])

  const loadAnalytics = async () => {
    if (!user || !store) return

    try {
      setIsLoading(true)
      const data = await mailchimpService.getAnalytics(user.id, store.id)
      setAnalytics(data)
    } catch (error) {
      console.error('Erreur chargement analytics:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics Mailchimp",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadAnalytics()
    setIsRefreshing(false)
    toast({
      title: "Actualisé",
      description: "Les données Mailchimp ont été actualisées"
    })
  }

  const openMailchimp = () => {
    window.open('https://mailchimp.com', '_blank')
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Chargement des données Mailchimp...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <img src="/mailchimp-logo.svg" alt="Mailchimp" className="h-8 w-8" />
              Tableau de bord Mailchimp
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos campagnes email et suivez vos performances
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </Button>
            <Button onClick={openMailchimp}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir Mailchimp
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abonnés</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.subscribers?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total des abonnés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.open_rate ? `${(analytics.open_rate * 100).toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Moyenne des campagnes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de clic</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.click_rate ? `${(analytics.click_rate * 100).toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Moyenne des campagnes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campagnes</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.campaigns || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total des campagnes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src="/mailchimp-logo.svg" alt="Mailchimp" className="h-5 w-5" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compte</p>
                <p className="text-lg">{integration.metadata?.account_name || 'Compte Mailchimp'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Center</p>
                <Badge variant="secondary">{integration.metadata?.dc || 'us1'}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statut</p>
                <Badge variant="default" className="bg-green-600">Actif</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col" onClick={openMailchimp}>
                <Mail className="h-6 w-6 mb-2" />
                <span>Créer une campagne</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={openMailchimp}>
                <Users className="h-6 w-6 mb-2" />
                <span>Gérer les abonnés</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={openMailchimp}>
                <BarChart3 className="h-6 w-6 mb-2" />
                <span>Voir les rapports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default MailchimpDashboard
