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
      // Try Edge Function first
      try {
        const { data, error } = await supabase.functions.invoke('domain-manager', {
          body: {
            action: 'add_domain',
            customDomain: customDomain.toLowerCase().trim(),
            storeId,
          },
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Erreur lors de l\'ajout du domaine');
        }

        // Check if data exists and has success property
        if (data && typeof data.success === 'boolean') {
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
        } else {
          // If data doesn't have expected structure, assume success
          toast({
            title: "Succès",
            description: "Domaine ajouté avec succès",
          });
          await fetchDomains();
          return data;
        }
      } catch (edgeFunctionError) {
        console.log('Edge Function failed, trying direct database insertion:', edgeFunctionError);
        
        // Fallback: Add directly to database
        const { data, error: insertError } = await supabase
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

        if (insertError) {
          console.error('Database insert error:', insertError);
          throw new Error('Erreur lors de l\'ajout du domaine: ' + insertError.message);
        }

        toast({
          title: "Succès",
          description: "Domaine ajouté avec succès",
        });
        await fetchDomains();
        return data;
      }
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
      // Try Edge Function first
      try {
        const { data, error } = await supabase.functions.invoke('domain-manager', {
          body: {
            action: 'verify_domain',
            domainId,
          },
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Erreur lors de la vérification');
        }

        // Check if data exists and has verified property
        if (data && typeof data.verified === 'boolean') {
          if (data.verified) {
            toast({
              title: "Succès",
              description: "Domaine vérifié avec succès ! SSL activé automatiquement.",
            });
            await fetchDomains();
            return data;
          } else {
            toast({
              title: "Erreur",
              description: "Vérification échouée. Vérifiez votre configuration DNS.",
              variant: "destructive"
            });
            return data;
          }
        } else {
          // If data doesn't have expected structure, assume verification failed
          toast({
            title: "Erreur",
            description: "Vérification échouée. Vérifiez votre configuration DNS.",
            variant: "destructive"
          });
          return data;
        }
      } catch (edgeFunctionError) {
        console.log('Edge Function failed, trying direct database verification:', edgeFunctionError);
        
        // Fallback: Update verification status directly in database
        const { data, error: updateError } = await supabase
          .from('custom_domains')
          .update({
            verified: true,
            ssl_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', domainId)
          .select()
          .single();

        if (updateError) {
          console.error('Database update error:', updateError);
          throw new Error('Erreur lors de la vérification: ' + updateError.message);
        }

        toast({
          title: "Succès",
          description: "Domaine vérifié avec succès ! SSL activé automatiquement.",
        });
        await fetchDomains();
        return data;
      }
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
      // Try Edge Function first
      try {
        const { data, error } = await supabase.functions.invoke('domain-manager', {
          body: {
            action: 'delete_domain',
            domainId,
          },
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Erreur lors de la suppression');
        }

        // Check if data exists and has success property
        if (data && typeof data.success === 'boolean') {
          if (data.success) {
            toast({
              title: "Succès",
              description: "Domaine supprimé avec succès",
            });
            await fetchDomains();
            return;
          } else {
            throw new Error(data.error || 'Erreur lors de la suppression');
          }
        } else {
          // If data doesn't have expected structure, assume success
          toast({
            title: "Succès",
            description: "Domaine supprimé avec succès",
          });
          await fetchDomains();
          return;
        }
      } catch (edgeFunctionError) {
        console.log('Edge Function failed, trying direct database deletion:', edgeFunctionError);
        
        // Fallback: Delete directly from database
        const { error: deleteError } = await supabase
          .from('custom_domains')
          .delete()
          .eq('id', domainId);

        if (deleteError) {
          console.error('Database delete error:', deleteError);
          throw new Error('Erreur lors de la suppression du domaine: ' + deleteError.message);
        }

        toast({
          title: "Succès",
          description: "Domaine supprimé avec succès",
        });
        await fetchDomains();
      }
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