import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CustomDomain {
  id: string;
  user_id: string;
  store_id: string;
  custom_domain: string;
  verification_token: string;
  verified: boolean;
  ssl_enabled: boolean;
  cloudflare_zone_id?: string;
  cloudflare_record_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCustomDomains = (storeId?: string) => {
  const { user } = useAuth();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

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
      toast.error('Erreur lors du chargement des domaines');
    } finally {
      setLoading(false);
    }
  };

  // Add a new custom domain
  const addDomain = async (customDomain: string) => {
    if (!user || !storeId) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cloudflare-domain-manager', {
        body: {
          action: 'add_domain',
          customDomain: customDomain.toLowerCase().trim(),
          storeId,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Domaine ajouté avec succès');
        await fetchDomains();
        return data;
      } else {
        throw new Error(data.error || 'Erreur lors de l\'ajout du domaine');
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      toast.error('Erreur lors de l\'ajout du domaine');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verify domain DNS configuration
  const verifyDomain = async (domainId: string) => {
    setVerifying(domainId);
    try {
      const { data, error } = await supabase.functions.invoke('cloudflare-domain-manager', {
        body: {
          action: 'verify_domain',
          domainId,
        },
      });

      if (error) throw error;

      if (data.verified) {
        toast.success('Domaine vérifié avec succès ! SSL activé automatiquement.');
        await fetchDomains();
      } else {
        toast.error('Vérification échouée. Vérifiez votre configuration DNS.');
      }

      return data;
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast.error('Erreur lors de la vérification');
      return null;
    } finally {
      setVerifying(null);
    }
  };

  // Delete a custom domain
  const deleteDomain = async (domainId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cloudflare-domain-manager', {
        body: {
          action: 'delete_domain',
          domainId,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Domaine supprimé avec succès');
        await fetchDomains();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast.error('Erreur lors de la suppression du domaine');
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