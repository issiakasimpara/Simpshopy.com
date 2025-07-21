
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ProductForm from './products/ProductForm';
import ProductDialogHeader from './products/dialog/ProductDialogHeader';
import { useProductSubmission } from './products/dialog/ProductSubmissionHandler';

type ProductStatus = 'draft' | 'active' | 'inactive';

interface FormData {
  name: string;
  description: string;
  price: string;
  sku: string;
  inventory_quantity: string;
  status: ProductStatus;
  images: string[];
  // Champs avancés
  tags: string[];
  weight: string;
  comparePrice: string;
  costPrice: string;
  trackInventory: boolean;
  allowBackorders: boolean;
  requiresShipping: boolean;
  seoTitle: string;
  seoDescription: string;
  // Variantes
  variants?: any[];
}

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
}

const AddProductDialog = ({ open, onOpenChange, storeId }: AddProductDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    sku: '',
    inventory_quantity: '',
    status: 'draft' as const,
    images: [],
    tags: [],
    weight: '',
    comparePrice: '',
    costPrice: '',
    trackInventory: false,
    allowBackorders: false,
    requiresShipping: true,
    seoTitle: '',
    seoDescription: '',
    variants: []
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      sku: '',
      inventory_quantity: '',
      status: 'draft',
      images: [],
      tags: [],
      weight: '',
      comparePrice: '',
      costPrice: '',
      trackInventory: false,
      allowBackorders: false,
      requiresShipping: true,
      seoTitle: '',
      seoDescription: '',
      variants: []
    });
  };

  const handleSuccess = () => {
    console.log('AddProductDialog - Product created successfully, resetting form');
    resetForm();
    onOpenChange(false);
  };

  const { handleSubmit, isCreating } = useProductSubmission({
    storeId,
    formData,
    onSuccess: handleSuccess
  });

  const handleFormDataChange = (data: FormData) => {
    console.log('AddProductDialog - Form data change (NO AUTO-SAVE):', data);
    setFormData(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <ProductDialogHeader 
          title="Ajouter un nouveau produit"
          formData={formData}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <ProductForm 
            formData={formData} 
            onFormDataChange={handleFormDataChange}
            isEditing={false}
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !formData.name || !formData.price}
            >
              {isCreating ? 'Création...' : 'Créer le produit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
