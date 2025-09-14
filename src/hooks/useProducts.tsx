import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { sqlSecurity } from '@/utils/sqlSecurity';
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
      console.log('useProducts - Fetching products for store:', storeId, 'with status filter:', statusFilter);
      
      if (!storeId) {
        console.log('useProducts - No storeId provided, returning empty array');
        return [];
      }
      
      // Construire les filtres de manière sécurisée
      const filters: Record<string, any> = { store_id: storeId };
      if (statusFilter === 'active') {
        filters.status = 'active';
      }

      const { data, error } = await sqlSecurity
        .buildSecureSelect('products', ['*', 'categories(name)'], filters, {
          orderBy: 'created_at',
          orderDirection: 'desc'
        });

      if (error) {
        console.error('useProducts - Error fetching products:', error);
        throw error;
      }

      console.log('useProducts - Successfully fetched products:', {
        count: data?.length || 0,
        statusFilter,
        products: data?.map(p => ({ id: p.id, name: p.name, price: p.price, status: p.status })) || []
      });

      return data || [];
    },
    enabled: !!storeId,
    staleTime: 30000, // Cache pendant 30 secondes
    retry: (failureCount, error) => {
      console.log('useProducts - Query failed, retry count:', failureCount, 'Error:', error);
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
      console.log('✅ Product creation successful, updating cache');
      
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
      console.log('✅ Product update successful, updating cache');
      
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
      console.log('🗑️ Attempting to delete product:', id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting product:', error);
        throw error;
      }
      
      console.log('✅ Product deleted successfully:', id);
      return id;
    },
    onSuccess: (deletedId) => {
      console.log('✅ Product deletion mutation successful, updating cache');
      
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
