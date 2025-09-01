import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MonerooService } from '@/services/monerooService';
import { MonerooPaymentData } from '@/services/monerooService';

export interface Payment {
  id: string;
  store_id: string;
  order_id?: string;
  moneroo_payment_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  customer_email: string;
  customer_name: string;
  description?: string;
  checkout_url?: string;
  return_url?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const usePayments = (storeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les paiements d'une boutique
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments', storeId],
    queryFn: async () => {
      if (!storeId) return [];

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId
  });

  // Initialiser un nouveau paiement
  const initializePayment = useMutation({
    mutationFn: async (paymentData: MonerooPaymentData & { storeId: string; orderId?: string }) => {
      // Vérifier si Moneroo est configuré pour cette boutique
      const isConfigured = await MonerooService.isConfigured(paymentData.storeId);
      if (!isConfigured) {
        throw new Error('Moneroo n\'est pas configuré pour cette boutique. Veuillez configurer Moneroo dans les paramètres de paiement.');
      }

      // 1. Initialiser le paiement avec Moneroo
      const monerooResponse = await MonerooService.initializePayment({
        ...paymentData,
        currency: 'XOF' // Devise XOF selon documentation Moneroo
        // Pas de methods pour laisser Moneroo choisir automatiquement
      });

      // 2. Sauvegarder dans la base de données
      const { data, error } = await supabase
        .from('payments')
        .insert({
          store_id: paymentData.storeId,
          order_id: paymentData.orderId,
          moneroo_payment_id: monerooResponse.data.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'pending',
          customer_email: paymentData.customer.email,
          customer_name: `${paymentData.customer.first_name} ${paymentData.customer.last_name}`,
          description: paymentData.description,
          checkout_url: monerooResponse.data.checkout_url,
          return_url: paymentData.return_url,
          metadata: paymentData.metadata
        })
        .select()
        .single();

      if (error) throw error;

      return {
        payment: data,
        monerooResponse
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Paiement initialisé",
        description: "Redirection vers la page de paiement...",
      });
      
      // Invalider le cache des paiements
      queryClient.invalidateQueries(['payments', storeId]);
    },
    onError: (error: any) => {
      console.error('Erreur initialisation paiement:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'initialisation du paiement.",
        variant: "destructive"
      });
    }
  });

  // Vérifier un paiement
  const verifyPayment = useMutation({
    mutationFn: async ({ paymentId, storeId }: { paymentId: string; storeId: string }) => {
      const result = await MonerooService.verifyPayment(paymentId, storeId);
      
      // Mettre à jour le statut dans la base de données
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: result.status,
          updated_at: new Date().toISOString()
        })
        .eq('moneroo_payment_id', paymentId);

      if (error) throw error;

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Paiement vérifié",
        description: `Statut: ${data.status}`,
      });
      
      // Invalider le cache des paiements
      queryClient.invalidateQueries(['payments', storeId]);
    },
    onError: (error: any) => {
      console.error('Erreur vérification paiement:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la vérification du paiement.",
        variant: "destructive"
      });
    }
  });

  return {
    payments,
    isLoading,
    error,
    initializePayment,
    verifyPayment
  };
}; 