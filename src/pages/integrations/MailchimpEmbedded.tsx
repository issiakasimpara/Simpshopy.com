import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useStores } from '@/hooks/useStores'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Mail, 
  BarChart3, 
  ExternalLink, 
  RefreshCw, 
  Loader2,
  TrendingUp,
  Eye,
  MousePointer,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface OAuthIntegration {
  id: string
  user_id: string
  store_id: string
  provider: string
  access_token: string
  refresh_token?: string
  token_expires_at: string
  provider_user_id?: string
  provider_account_id?: string
  metadata?: {
    account_name?: string
    dc?: string
    api_endpoint?: string
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

const MailchimpEmbedded = () => {
  const { user } = useAuth()
  const { store } = useStores()
  const { toast } = useToast()
  const [integration, setIntegration] = useState<OAuthIntegration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Récupérer l'intégration Mailchimp
  useEffect(() => {
    const loadIntegration = async () => {
      if (!user || !store) {
        setIsLoading(false)
        return
      }

      try {
        console.log('🔍 Chargement intégration Mailchimp...')
        
        const { data, error } = await supabase
          .from('oauth_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('store_id', store.id)
          .eq('provider', 'mailchimp')
          .eq('is_active', true)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erreur chargement intégration:', error)
          toast({
            title: "Erreur",
            description: "Impossible de charger l'intégration Mailchimp",
            variant: "destructive"
          })
          return
        }

        if (data) {
          console.log('✅ Intégration Mailchimp trouvée:', data.metadata?.account_name)
          setIntegration(data)
        } else {
          console.log('ℹ️ Aucune intégration Mailchimp trouvée')
          toast({
            title: "Aucune intégration",
            description: "Aucune intégration Mailchimp active trouvée",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('❌ Erreur chargement intégration:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger l'intégration Mailchimp",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadIntegration()
  }, [user, store, toast])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const openInNewTab = () => {
    const dataCenter = integration?.metadata?.dc || 'us1'
    window.open(`https://${dataCenter}.admin.mailchimp.com/`, '_blank')
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Chargement de Mailchimp...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!integration) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <img src="/mailchimp-logo.svg" alt="Mailchimp" className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucune intégration Mailchimp</h2>
            <p className="text-muted-foreground mb-4">
              Vous devez d'abord installer Mailchimp pour accéder à l'interface intégrée.
            </p>
            <Button onClick={() => window.location.href = '/integrations/mailchimp'}>
              Installer Mailchimp
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const dataCenter = integration.metadata?.dc || 'us1'
  const mailchimpUrl = `https://${dataCenter}.admin.mailchimp.com/`

  return (
    <DashboardLayout>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'space-y-6'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between ${isFullscreen ? 'p-4 border-b' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <img src="/mailchimp-logo.svg" alt="Mailchimp" className="h-8 w-8" />
              Mailchimp Intégré
            </h1>
            <p className="text-muted-foreground mt-2">
              Interface Mailchimp directement dans Simpshopy
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 mr-2" />
              ) : (
                <Maximize2 className="h-4 w-4 mr-2" />
              )}
              {isFullscreen ? 'Réduire' : 'Plein écran'}
            </Button>
            <Button onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir dans un nouvel onglet
            </Button>
          </div>
        </div>

        {/* Mailchimp Interface */}
        <div className={`${isFullscreen ? 'flex-1' : 'h-[800px]'}`}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <img src="/mailchimp-logo.svg" alt="Mailchimp" className="h-5 w-5" />
                  Interface Mailchimp
                </CardTitle>
                <Badge variant="secondary">
                  Data Center: {dataCenter}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <div className="h-full">
                <iframe
                  src={mailchimpUrl}
                  className="w-full h-full border-0"
                  title="Mailchimp Interface"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation rapide */}
        {!isFullscreen && (
          <Card>
            <CardHeader>
              <CardTitle>Navigation rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                  <TabsTrigger value="automation">Automatisation</TabsTrigger>
                  <TabsTrigger value="reports">Rapports</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-12"
                    onClick={() => window.open(`${mailchimpUrl}`, '_blank')}
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Ouvrir Dashboard Mailchimp
                  </Button>
                </TabsContent>
                <TabsContent value="campaigns" className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-12"
                    onClick={() => window.open(`${mailchimpUrl}campaigns/`, '_blank')}
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Gérer les campagnes
                  </Button>
                </TabsContent>
                <TabsContent value="audience" className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-12"
                    onClick={() => window.open(`${mailchimpUrl}lists/`, '_blank')}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Gérer l'audience
                  </Button>
                </TabsContent>
                <TabsContent value="automation" className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-12"
                    onClick={() => window.open(`${mailchimpUrl}automation/`, '_blank')}
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Configurer l'automatisation
                  </Button>
                </TabsContent>
                <TabsContent value="reports" className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-12"
                    onClick={() => window.open(`${mailchimpUrl}reports/`, '_blank')}
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Voir les rapports
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MailchimpEmbedded
