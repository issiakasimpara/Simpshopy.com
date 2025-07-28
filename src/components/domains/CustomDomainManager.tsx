import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  CheckCircle, 
  Loader2, 
  Trash2,
  RefreshCw,
  XCircle,
  Shield,
  Zap,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';
import { DomainService, DomainData } from '../../services/domainService';
import { VercelService, VercelDomainStatus } from '../../services/vercelService';
import { useToast } from '@/hooks/use-toast';

interface CustomDomainManagerProps {
  storeId: string;
  storeName: string;
}

const CustomDomainManager = ({ storeId, storeName }: CustomDomainManagerProps) => {
  const [domains, setDomains] = useState<DomainData[]>([])
  const [vercelStatuses, setVercelStatuses] = useState<Record<string, VercelDomainStatus>>({})
  const [newDomain, setNewDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const { toast } = useToast()

  // Charger les domaines au montage
  const loadDomains = useCallback(async () => {
    try {
      setLoading(true)
      const data = await DomainService.getDomains(storeId)
      setDomains(data)
      
      // Charger les statuts Vercel pour chaque domaine
      const statuses: Record<string, VercelDomainStatus> = {}
      for (const domain of data) {
        try {
          const status = await VercelService.getDomainStatus(domain.domain)
          statuses[domain.domain] = status
        } catch (error) {
          console.error(`❌ Error loading Vercel status for ${domain.domain}:`, error)
        }
      }
      setVercelStatuses(statuses)
    } catch (error) {
      console.error('❌ Load domains error:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les domaines",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [storeId, toast])

  useEffect(() => {
    loadDomains()
  }, [loadDomains])

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un domaine",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      // 1. Ajouter à Vercel
      const vercelStatus = await VercelService.addDomain(newDomain.trim())
      
      // 2. Ajouter à Supabase
      const domain = await DomainService.addDomain(newDomain.trim(), storeId)
      
      // 3. Mettre à jour les listes
      setDomains(prev => [domain, ...prev])
      setVercelStatuses(prev => ({ ...prev, [domain.domain]: vercelStatus }))
      setNewDomain('')
      
      toast({
        title: "Succès",
        description: `Domaine ${domain.domain} ajouté ! Configuration Vercel en cours...`
      })
    } catch (error: unknown) {
      console.error('❌ Add domain error:', error)
      const errorMessage = error instanceof Error ? error.message : "Impossible d'ajouter le domaine"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshVercelStatus = async (domainName: string) => {
    try {
      setRefreshing(domainName)
      const status = await VercelService.getDomainStatus(domainName)
      setVercelStatuses(prev => ({ ...prev, [domainName]: status }))
      
      toast({
        title: "Statut mis à jour",
        description: `Statut Vercel actualisé pour ${domainName}`
      })
    } catch (error) {
      console.error('❌ Refresh status error:', error)
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir le statut",
        variant: "destructive"
      })
    } finally {
      setRefreshing(null)
    }
  }

  const handleVerifyDomain = async (domainId: string) => {
    try {
      setVerifying(domainId)
      const isVerified = await DomainService.verifyDomain(domainId)
      
      // Mettre à jour la liste
      setDomains(prev => prev.map(domain => 
        domain.id === domainId 
          ? { ...domain, verified: isVerified, ssl_enabled: isVerified }
          : domain
      ))

      // Rafraîchir le statut Vercel
      const domain = domains.find(d => d.id === domainId)
      if (domain) {
        await handleRefreshVercelStatus(domain.domain)
      }

      toast({
        title: isVerified ? "Domaine vérifié !" : "Vérification échouée",
        description: isVerified 
          ? "Votre domaine est maintenant actif avec SSL"
          : "Configurez vos DNS pour pointer vers simpshopy.com"
      })
    } catch (error: unknown) {
      console.error('❌ Verify domain error:', error)
      const errorMessage = error instanceof Error ? error.message : "Impossible de vérifier le domaine"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setVerifying(null)
    }
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce domaine ?')) {
      return
    }

    try {
      setDeleting(domainId)
      const domain = domains.find(d => d.id === domainId)
      
      // Supprimer de Vercel
      if (domain) {
        try {
          await VercelService.deleteDomain(domain.domain)
        } catch (vercelError) {
          console.error('❌ Vercel delete error:', vercelError)
        }
      }
      
      // Supprimer de Supabase
      await DomainService.deleteDomain(domainId)
      
      // Retirer de la liste
      setDomains(prev => prev.filter(domain => domain.id !== domainId))
      if (domain) {
        setVercelStatuses(prev => {
          const newStatuses = { ...prev }
          delete newStatuses[domain.domain]
          return newStatuses
        })
      }
      
      toast({
        title: "Succès",
        description: "Domaine supprimé avec succès"
      })
    } catch (error: unknown) {
      console.error('❌ Delete domain error:', error)
      const errorMessage = error instanceof Error ? error.message : "Impossible de supprimer le domaine"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  const formatDomain = (domain: string) => {
    return domain.startsWith('www.') ? domain : `www.${domain}`
  }

  const getDomainStatus = (domain: DomainData) => {
    const vercelStatus = vercelStatuses[domain.domain]
    
    if (vercelStatus?.status === 'active' && domain.verified) {
      return { status: 'active', label: 'Actif', icon: CheckCircle, color: 'bg-green-100 text-green-800' }
    } else if (vercelStatus?.status === 'active') {
      return { status: 'vercel-active', label: 'Vercel actif', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' }
    } else if (domain.verified) {
      return { status: 'verified', label: 'Vérifié', icon: CheckCircle, color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'pending', label: 'En attente', icon: XCircle, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copié !",
      description: "Instructions copiées dans le presse-papiers",
    })
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Domaines personnalisés</h2>
          <p className="text-gray-600">
            Connectez votre propre nom de domaine à votre boutique {storeName}
          </p>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Ajouter un domaine
          </CardTitle>
          <CardDescription>
            Entrez votre nom de domaine (ex: www.maboutique.com)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="www.maboutique.com"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
            />
            <Button 
              onClick={handleAddDomain} 
              disabled={loading || !newDomain.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                'Ajouter'
              )}
            </Button>
          </div>
          
          {/* Instructions DNS */}
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Instructions DNS :</strong> Ajoutez un CNAME record pointant vers{' '}
              <code className="bg-gray-100 px-1 rounded">simpshopy.com</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('simpshopy.com')}
                className="ml-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Liste des domaines */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vos domaines</h3>
        
        {loading && domains.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : domains.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun domaine configuré</p>
              <p className="text-sm">Ajoutez votre premier domaine ci-dessus</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {domains.map((domain) => {
              const status = getDomainStatus(domain)
              const StatusIcon = status.icon
              const vercelStatus = vercelStatuses[domain.domain]
              
              return (
                <Card key={domain.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* En-tête du domaine */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{formatDomain(domain.domain)}</p>
                            <p className="text-sm text-gray-500">
                              Ajouté le {new Date(domain.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefreshVercelStatus(domain.domain)}
                            disabled={refreshing === domain.domain}
                          >
                            {refreshing === domain.domain ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDomain(domain.id)}
                            disabled={deleting === domain.id}
                          >
                            {deleting === domain.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Statut Vercel en temps réel */}
                      {vercelStatus && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">CDN Vercel</span>
                            <Badge variant={vercelStatus.cdn ? "default" : "secondary"}>
                              {vercelStatus.cdn ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">SSL</span>
                            <Badge variant={vercelStatus.ssl ? "default" : "secondary"}>
                              {vercelStatus.ssl ? "Actif" : "En cours"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Statut</span>
                            <Badge variant={vercelStatus.status === 'active' ? "default" : "secondary"}>
                              {vercelStatus.status === 'active' ? 'Actif' : 'En attente'}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {status.status !== 'active' && (
                          <Button
                            onClick={() => handleVerifyDomain(domain.id)}
                            disabled={verifying === domain.id}
                            className="flex-1"
                          >
                            {verifying === domain.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Vérifier la configuration DNS
                          </Button>
                        )}
                        
                        {vercelStatus?.status === 'active' && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Visiter
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* Instructions DNS si pas vérifié */}
                      {!domain.verified && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Configuration DNS requise :</strong> Ajoutez un CNAME record dans votre gestionnaire DNS
                            <div className="mt-2 p-2 bg-gray-100 rounded text-sm font-mono">
                              {domain.domain} → simpshopy.com
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomDomainManager;