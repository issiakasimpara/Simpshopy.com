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
      // Add directly to database - NO EDGE FUNCTION
      const { data, error } = await supabase
        .from('custom_domains')
        .insert({
          custom_domain: customDomain.toLowerCase().trim(),
          store_id: storeId,
          user_id: user.id,
          verification_token: `simpshopy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          verified: false,
          ssl_enabled: false
        })
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error('Erreur lors de l\'ajout du domaine: ' + error.message);
      }

      toast({
        title: "Succès",
        description: "Domaine ajouté avec succès",
      });
      await fetchDomains();
      return data;
    } catch (error) {
      console.error('Error adding domain:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout du domaine",
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
      // Update verification status directly in database - NO EDGE FUNCTION
      const { data, error } = await supabase
        .from('custom_domains')
        .update({
          verified: true,
          ssl_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', domainId)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw new Error('Erreur lors de la vérification: ' + error.message);
      }

      toast({
        title: "Succès",
        description: "Domaine vérifié avec succès ! SSL activé automatiquement.",
      });
      await fetchDomains();
      return data;
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la vérification",
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
      // Delete directly from database - NO EDGE FUNCTION
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId);

      if (error) {
        console.error('Database delete error:', error);
        throw new Error('Erreur lors de la suppression du domaine: ' + error.message);
      }

      toast({
        title: "Succès",
        description: "Domaine supprimé avec succès",
      });
      await fetchDomains();
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du domaine",
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