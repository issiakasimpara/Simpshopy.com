import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartSession } from './useCartSessions';

export interface AbandonedCart extends CartSession {
  days_abandoned: number;
  total_value: number;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface AbandonedCartsStats {
  totalAbandoned: number;
  totalValue: number;
  averageValue: number;
  recentAbandoned: number; // Paniers abandonnés dans les dernières 24h
}

export const useAbandonedCarts = (storeId?: string) => {
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<AbandonedCartsStats>({
    totalAbandoned: 0,
    totalValue: 0,
    averageValue: 0,
    recentAbandoned: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Récupérer les statistiques des paniers abandonnés
  const fetchAbandonedCartsStats = async () => {
    if (!storeId) {
      console.log('❌ Pas de storeId fourni pour les stats');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📊 Calcul des statistiques paniers abandonnés pour storeId:', storeId);

      // Récupérer toutes les sessions de panier pour cette boutique
      const { data: cartSessions, error } = await supabase
        .from('cart_sessions')
        .select('*')
        .eq('store_id', storeId)
        .not('items', 'eq', '[]')
        .not('items', 'is', null);

      if (error) {
        console.error('Erreur lors de la récupération des stats paniers abandonnés:', error);
        return;
      }

      const abandoned = (cartSessions || [])
        .map(session => {
          const items = Array.isArray(session.items) ? session.items as any[] : [];
          const totalValue = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
          const customerInfo = session.customer_info as any || {};
          const daysAbandoned = Math.floor((Date.now() - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24));

          return {
            ...session,
            items: items as any,
            total_value: totalValue,
            days_abandoned: daysAbandoned,
            customer_email: customerInfo.email,
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone
          } as AbandonedCart;
        });

      // Calculer les statistiques
      const totalAbandoned = abandoned.length;
      const totalValue = abandoned.reduce((sum, cart) => sum + cart.total_value, 0);
      const averageValue = totalAbandoned > 0 ? totalValue / totalAbandoned : 0;
      const recentAbandoned = abandoned.filter(cart => cart.days_abandoned <= 1).length;

      const newStats: AbandonedCartsStats = {
        totalAbandoned,
        totalValue,
        averageValue,
        recentAbandoned
      };

      console.log('📊 Stats paniers abandonnés calculées:', newStats);
      setStats(newStats);
      setAbandonedCarts(abandoned);
    } catch (error) {
      console.error('Erreur lors du calcul des stats paniers abandonnés:', error);
      toast({
        title: "Erreur",
        description: "Impossible de calculer les statistiques des paniers abandonnés.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les paniers abandonnés
  const fetchAbandonedCarts = async () => {
    if (!storeId) {
      console.log('❌ Pas de storeId fourni');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 Recherche des paniers abandonnés pour storeId:', storeId);

      // Récupérer toutes les sessions de panier pour cette boutique
      const { data: cartSessions, error } = await supabase
        .from('cart_sessions')
        .select('*')
        .eq('store_id', storeId)
        .not('items', 'eq', '[]')
        .not('items', 'is', null);

      console.log('📊 Résultat de la requête cart_sessions:', { data: cartSessions, error });

      if (error) {
        console.error('Erreur lors de la récupération des paniers abandonnés:', error);
        return;
      }

      // Pour l'instant, considérer tous les paniers comme abandonnés
      // (on peut améliorer cette logique plus tard)
      const abandoned = (cartSessions || [])
        .map(session => {
          const items = Array.isArray(session.items) ? session.items as any[] : [];
          const totalValue = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
          const customerInfo = session.customer_info as any || {};
          const daysAbandoned = Math.floor((Date.now() - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24));

          return {
            ...session,
            items: items as any,
            total_value: totalValue,
            days_abandoned: daysAbandoned,
            customer_email: customerInfo.email,
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone
          } as AbandonedCart;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('🔍 Paniers abandonnés trouvés:', abandoned.length);
      console.log('📋 Détails des paniers:', abandoned);
      setAbandonedCarts(abandoned);
    } catch (error) {
      console.error('Erreur lors de la récupération des paniers abandonnés:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les paniers abandonnés.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un panier abandonné
  const deleteAbandonedCart = async (cartId: string) => {
    try {
      const { error } = await supabase
        .from('cart_sessions')
        .delete()
        .eq('id', cartId);

      if (error) {
        throw error;
      }

      // Mettre à jour la liste locale
      setAbandonedCarts(prev => prev.filter(cart => cart.id !== cartId));
      
      // Recalculer les stats
      await fetchAbandonedCartsStats();

      toast({
        title: "Succès",
        description: "Panier abandonné supprimé avec succès.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le panier abandonné.",
        variant: "destructive"
      });
    }
  };

  // Envoyer un email de rappel (placeholder)
  const sendReminderEmail = async (cart: AbandonedCart) => {
    // TODO: Implémenter l'envoi d'email
    console.log('📧 Envoi email de rappel pour:', cart.customer_email);
    toast({
      title: "Fonctionnalité à venir",
      description: "L'envoi d'emails de rappel sera bientôt disponible.",
      variant: "default"
    });
  };

  useEffect(() => {
    if (storeId) {
      fetchAbandonedCartsStats();
    }
  }, [storeId]);

  return {
    abandonedCarts,
    stats,
    isLoading,
    fetchAbandonedCarts,
    fetchAbandonedCartsStats,
    deleteAbandonedCart,
    sendReminderEmail
  };
}; 