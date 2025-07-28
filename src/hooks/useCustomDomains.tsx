import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { DomainService } from '@/services/domainService';

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

  // Add a new custom domain with automatic Vercel/Cloudflare setup
  const addDomain = async (customDomain: string) => {
    if (!user || !storeId) return null;
    
    setLoading(true);
    try {
      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(customDomain)) {
        throw new Error('Format de domaine invalide. Exemple: ma-boutique.com');
      }

      // Check if domain already exists
      const { data: existingDomain } = await supabase
        .from('custom_domains')
        .select('id')
        .eq('custom_domain', customDomain.toLowerCase().trim())
        .single();

      if (existingDomain) {
        throw new Error('Ce domaine est déjà configuré');
      }

      // Call Edge Function for automatic setup
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session non valide');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/domain-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'add_domain',
          customDomain: customDomain.toLowerCase().trim(),
          storeId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du domaine');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'ajout du domaine');
      }

      toast({
        title: "✅ Domaine ajouté !",
        description: result.message || "Configuration automatique en cours...",
      });

      await fetchDomains();
      return result.domain;
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

  // Verify domain with real DNS check
  const verifyDomain = async (domainId: string) => {
    setVerifying(domainId);
    try {
      console.log('🔍 Starting domain verification for ID:', domainId);
      
      // Get domain info
      const { data: domainData, error: fetchError } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('id', domainId)
        .single();

      if (fetchError || !domainData) {
        throw new Error('Domaine non trouvé');
      }

      console.log('🔍 Domain data:', domainData);

      // Call Edge Function for verification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session non valide');
      }

      console.log('🔍 Session valid, calling Edge Function...');
      console.log('🔍 Edge Function URL:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/domain-manager`);

      const response = await fetch(`https://grutldacuowplosarucp.supabase.co/functions/v1/domain-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'verify_domain',
          domainId
        })
      });

      console.log('🔍 Edge Function response status:', response.status);
      console.log('🔍 Edge Function response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔍 Edge Function error:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la vérification');
      }

      const result = await response.json();
      console.log('🔍 Edge Function result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la vérification');
      }

      toast({
        title: result.verified ? "✅ Domaine vérifié !" : "❌ Vérification échouée",
        description: result.message,
        variant: result.verified ? "default" : "destructive"
      });
      
      await fetchDomains();
      return result;
    } catch (error) {
      console.error('🔍 Error verifying domain:', error);
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
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId);

      if (error) {
        console.error('Database delete error:', error);
        throw new Error('Erreur lors de la suppression du domaine: ' + error.message);
      }

      toast({
        title: "Domaine supprimé",
        description: "Le domaine a été supprimé de votre boutique",
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

  // Get DNS configuration instructions
  const getDNSInstructions = (domain: string) => {
    return DomainService.getManualInstructions(domain);
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
    getDNSInstructions,
    fetchDomains
  };
};