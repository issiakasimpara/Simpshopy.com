
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CreateStoreDialog from '@/components/CreateStoreDialog';
import AddProductDialog from '@/components/AddProductDialog';
import EditProductDialog from '@/components/EditProductDialog';
import ProductsHeader from '@/components/products/ProductsHeader';
import ProductList from '@/components/products/ProductList';
import NoStoreSelected from '@/components/products/NoStoreSelected';
import { useProducts } from '@/hooks/useProducts';
import { useStores } from '@/hooks/useStores';
import type { Tables } from '@/integrations/supabase/types';

const Products = () => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Tables<'products'> | null>(null);
  
  const { stores } = useStores();
  const { products, isLoading, deleteProduct } = useProducts(selectedStoreId);

  // Auto-select the first store when stores are loaded
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  const handleStoreCreated = (storeId: string) => {
    setSelectedStoreId(storeId);
  };

  const handleEditProduct = (product: Tables<'products'>) => {
    setSelectedProduct(product);
    setShowEditProduct(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(productId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header avec gradient moderne */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-indigo-600/5 rounded-3xl" />
          <div className="relative p-8 bg-gradient-to-br from-background via-background to-muted/20 rounded-3xl border border-border/50 shadow-lg">
            <ProductsHeader
              selectedStoreId={selectedStoreId}
              onStoreSelect={setSelectedStoreId}
              onCreateStore={() => setShowCreateStore(true)}
              onAddProduct={() => setShowAddProduct(true)}
              productCount={products.length}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {selectedStoreId ? (
            <div className="bg-gradient-to-br from-background via-background to-muted/10 rounded-2xl border border-border/50 shadow-lg p-6">
              <ProductList
                products={products}
                isLoading={isLoading}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddProduct={() => setShowAddProduct(true)}
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-background via-background to-muted/20 rounded-3xl border border-border/50 shadow-lg p-8">
              <NoStoreSelected />
            </div>
          )}
        </div>
      </div>

      <CreateStoreDialog 
        open={showCreateStore} 
        onOpenChange={setShowCreateStore}
        onStoreCreated={handleStoreCreated}
      />

      {selectedStoreId && (
        <>
          <AddProductDialog 
            open={showAddProduct} 
            onOpenChange={setShowAddProduct}
            storeId={selectedStoreId}
          />

          <EditProductDialog 
            open={showEditProduct} 
            onOpenChange={setShowEditProduct}
            product={selectedProduct}
            storeId={selectedStoreId}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default Products;
