import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface CustomDomain {
  id: string;
  custom_domain: string;
  verified: boolean;
  ssl_enabled: boolean;
  verification_token: string;
  created_at: string;
  updated_at: string;
}

export const useCustomDomains = (storeId?: string) => {
  const { user } = useAuth();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch domains for the current user/store
  const fetchDomains = async () => {
    if (!user || !storeId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDomains(data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des domaines",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new custom domain
  const addDomain = async (customDomain: string) => {
    if (!user || !storeId) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('domain-manager', {
        body: {
          action: 'add_domain',
          customDomain: customDomain.toLowerCase().trim(),
          storeId,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Succès",
          description: "Domaine ajouté avec succès",
        });
        await fetchDomains();
        return data;
      } else {
        throw new Error(data.error || 'Erreur lors de l\'ajout du domaine');
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du domaine",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verify domain DNS configuration
  const verifyDomain = async (domainId: string) => {
    setVerifying(domainId);
    try {
      const { data, error } = await supabase.functions.invoke('domain-manager', {
        body: {
          action: 'verify_domain',
          domainId,
        },
      });

      if (error) throw error;

      if (data.verified) {
        toast({
          title: "Succès",
          description: "Domaine vérifié avec succès ! SSL activé automatiquement.",
        });
        await fetchDomains();
      } else {
        toast({
          title: "Erreur",
          description: "Vérification échouée. Vérifiez votre configuration DNS.",
          variant: "destructive"
        });
      }

      return data;
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la vérification",
        variant: "destructive"
      });
      return null;
    } finally {
      setVerifying(null);
    }
  };

  // Delete a custom domain
  const deleteDomain = async (domainId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('domain-manager', {
        body: {
          action: 'delete_domain',
          domainId,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Succès",
          description: "Domaine supprimé avec succès",
        });
        await fetchDomains();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du domaine",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [user, storeId]);

  return {
    domains,
    loading,
    verifying,
    addDomain,
    verifyDomain,
    deleteDomain,
    refetch: fetchDomains,
  };
};