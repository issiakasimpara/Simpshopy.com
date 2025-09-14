import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { logger } from '@/utils/logger';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductInsert = TablesInsert<'products'>;
type ProductUpdate = TablesUpdate<'products'>;

export const useProducts = (storeId?: string, statusFilter?: 'active' | 'all') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products', storeId, statusFilter],
    queryFn: async () => {
      logger.debug('Fetching products for store', { storeId, statusFilter }, 'useProducts');
      
      if (!storeId) {
        logger.warn('No storeId provided, returning empty array', undefined, 'useProducts');
        return [];
      }
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      // Si on spécifie un filtre de statut, l'appliquer
      if (statusFilter === 'active') {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;

      if (error) {
        console.error('useProducts - Error fetching products:', error);
        throw error;
      }

      logger.debug('Successfully fetched products', {
        count: data?.length || 0,
        statusFilter,
        products: data?.map(p => ({ id: p.id, name: p.name, price: p.price, status: p.status })) || []
      }, 'useProducts');

      return data || [];
    },
    enabled: !!storeId,
    staleTime: 30000, // Cache pendant 30 secondes
    retry: (failureCount, error) => {
      logger.error('Query failed', { retryCount: failureCount, error: error.message }, 'useProducts');
      return failureCount < 3;
    }
  });

  const createProduct = useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newProduct) => {
      logger.info('Product creation successful, updating cache', undefined, 'useProducts');
      
      // Invalider toutes les queries de produits pour ce store
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });
      
      toast({
        title: "Produit créé !",
        description: "Votre produit a été ajouté avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit. " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: ProductUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedProduct) => {
      logger.info('Product update successful, updating cache', undefined, 'useProducts');
      
      // Mise à jour optimiste du cache pour toutes les variantes de la query
      queryClient.setQueryData(['products', storeId, 'all'], (old: any) => {
        if (!old) return [updatedProduct];
        return old.map((p: any) => p.id === updatedProduct.id ? updatedProduct : p);
      });
      
      queryClient.setQueryData(['products', storeId, 'active'], (old: any) => {
        if (!old) return [updatedProduct];
        return old.map((p: any) => p.id === updatedProduct.id ? updatedProduct : p);
      });
      
      toast({
        title: "Produit mis à jour !",
        description: "Les modifications ont été sauvegardées.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit. " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      logger.info('Attempting to delete product', { productId: id }, 'useProducts');
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting product:', error);
        throw error;
      }
      
      logger.info('Product deleted successfully', { productId: id }, 'useProducts');
      return id;
    },
    onSuccess: (deletedId) => {
      logger.info('Product deletion mutation successful, updating cache', undefined, 'useProducts');
      
      // Mise à jour optimiste du cache pour toutes les variantes de la query
      queryClient.setQueryData(['products', storeId, 'all'], (old: any) => {
        if (!old) return [];
        return old.filter((p: any) => p.id !== deletedId);
      });
      
      queryClient.setQueryData(['products', storeId, 'active'], (old: any) => {
        if (!old) return [];
        return old.filter((p: any) => p.id !== deletedId);
      });
      
      // Invalider toutes les queries de produits pour ce store
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });
      
      toast({
        title: "Produit supprimé !",
        description: "Le produit a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit. " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    products: products || [],
    isLoading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating: createProduct.isPending,
    isUpdating: updateProduct.isPending,
    isDeleting: deleteProduct.isPending,
  };
};
