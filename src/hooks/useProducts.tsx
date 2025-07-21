import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductInsert = TablesInsert<'products'>;
type ProductUpdate = TablesUpdate<'products'>;

export const useProducts = (storeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products', storeId],
    queryFn: async () => {
      console.log('useProducts - Fetching products for store:', storeId);
      
      if (!storeId) {
        console.log('useProducts - No storeId provided, returning empty array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useProducts - Error fetching products:', error);
        throw error;
      }

      console.log('useProducts - Successfully fetched products:', {
        count: data?.length || 0,
        products: data?.map(p => ({ id: p.id, name: p.name, price: p.price })) || []
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
      // Mise à jour optimiste du cache au lieu d'invalidation
      queryClient.setQueryData(['products', storeId], (old: any) => {
        if (!old) return [newProduct];
        return [newProduct, ...old];
      });
      
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
      // Mise à jour optimiste du cache
      queryClient.setQueryData(['products', storeId], (old: any) => {
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
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      // Mise à jour optimiste du cache
      queryClient.setQueryData(['products', storeId], (old: any) => {
        if (!old) return [];
        return old.filter((p: any) => p.id !== deletedId);
      });
      
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
    createProduct: createProduct.mutateAsync,
    updateProduct: updateProduct.mutateAsync,
    deleteProduct: deleteProduct.mutate,
    isCreating: createProduct.isPending,
    isUpdating: updateProduct.isPending,
    isDeleting: deleteProduct.isPending,
  };
};
