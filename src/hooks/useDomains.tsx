
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Domain {
  id: string;
  store_id: string;
  domain_name: string;
  cloudflare_zone_id?: string;
  status: 'pending' | 'active' | 'error' | 'verifying';
  ssl_status: 'pending' | 'active' | 'error' | 'provisioning';
  is_verified: boolean;
  last_verified_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useDomains = (storeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les domaines d'un store
  const { data: domains, isLoading } = useQuery({
    queryKey: ['domains', storeId],
    queryFn: async () => {
      if (!storeId) return [];

      console.log('Fetching domains for store:', storeId);

      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching domains:', error);
        throw error;
      }

      console.log('Domains fetched:', data);
      return data || [];
    },
    enabled: !!storeId,
    // ⚡ OPTIMISATION: Domaines changent rarement
    refetchInterval: 10 * 60 * 1000, // 10 minutes au lieu de 30 secondes
    staleTime: 5 * 60 * 1000, // 5 minutes de cache
    cacheTime: 30 * 60 * 1000, // Cache pendant 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Configurer un nouveau domaine
  const configureDomain = useMutation({
    mutationFn: async ({ domainName, storeId }: { domainName: string; storeId: string }) => {
      console.log('Configuring domain:', domainName, 'for store:', storeId);
      
      const { data, error } = await supabase.functions.invoke('cloudflare-domains', {
        body: {
          action: 'configure',
          storeId,
          domainName: domainName.toLowerCase().trim()
        }
      });

      console.log('Configuration response:', data, error);

      if (error) {
        console.error('Configuration error:', error);
        throw error;
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast({
        title: "Domaine configuré !",
        description: `${variables.domainName} a été configuré avec succès. Configurez maintenant les serveurs de noms chez votre registraire.`,
      });
    },
    onError: (error: any) => {
      console.error('Domain configuration error:', error);
      toast({
        title: "Erreur de configuration",
        description: error.message || "Impossible de configurer le domaine. Vérifiez les logs pour plus de détails.",
        variant: "destructive",
      });
    },
  });

  // Vérifier un domaine
  const verifyDomain = useMutation({
    mutationFn: async (domainName: string) => {
      console.log('Verifying domain:', domainName);
      
      const { data, error } = await supabase.functions.invoke('cloudflare-domains', {
        body: {
          action: 'verify',
          domainName
        }
      });

      console.log('Verification response:', data, error);

      if (error) {
        console.error('Verification error:', error);
        throw error;
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    },
    onSuccess: (data, domainName) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      
      if (data.verified) {
        toast({
          title: "Domaine vérifié !",
          description: `${domainName} est maintenant actif.`,
        });
      } else {
        toast({
          title: "Vérification en cours",
          description: "La propagation DNS peut prendre jusqu'à 48h. Statut actuel: " + data.status,
        });
      }
    },
    onError: (error: any) => {
      console.error('Domain verification error:', error);
      toast({
        title: "Erreur de vérification",
        description: error.message || "Impossible de vérifier le domaine.",
        variant: "destructive",
      });
    },
  });

  // Supprimer un domaine
  const removeDomain = useMutation({
    mutationFn: async (domainName: string) => {
      console.log('Removing domain:', domainName);
      
      const { data, error } = await supabase.functions.invoke('cloudflare-domains', {
        body: {
          action: 'remove',
          domainName
        }
      });

      console.log('Removal response:', data, error);

      if (error) {
        console.error('Removal error:', error);
        throw error;
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    },
    onSuccess: (data, domainName) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast({
        title: "Domaine supprimé",
        description: `${domainName} a été supprimé avec succès.`,
      });
    },
    onError: (error: any) => {
      console.error('Domain removal error:', error);
      toast({
        title: "Erreur de suppression",
        description: error.message || "Impossible de supprimer le domaine.",
        variant: "destructive",
      });
    },
  });

  return {
    domains: domains || [],
    isLoading,
    configureDomain: configureDomain.mutateAsync,
    verifyDomain: verifyDomain.mutateAsync,
    removeDomain: removeDomain.mutateAsync,
    isConfiguring: configureDomain.isPending,
    isVerifying: verifyDomain.isPending,
    isRemoving: removeDomain.isPending,
  };
};
