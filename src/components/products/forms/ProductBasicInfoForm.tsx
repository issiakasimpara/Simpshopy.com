
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

type ProductStatus = 'draft' | 'active' | 'inactive';

interface FormData {
  name: string;
  description: string;
  price: string;
  sku: string;
  inventory_quantity: string;
  status: ProductStatus;
}

interface ProductBasicInfoFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const ProductBasicInfoForm = ({ formData, onFormDataChange }: ProductBasicInfoFormProps) => {
  const updateFormData = (field: keyof FormData, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Informations de base
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="Ex: T-shirt élégant"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sku">Référence (SKU)</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => updateFormData('sku', e.target.value)}
              placeholder="Ex: TSH-001"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder="Décrivez votre produit en détail..."
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Prix (CFA) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => updateFormData('price', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="inventory_quantity">Stock initial</Label>
            <Input
              id="inventory_quantity"
              type="number"
              min="0"
              value={formData.inventory_quantity}
              onChange={(e) => updateFormData('inventory_quantity', e.target.value)}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: ProductStatus) => updateFormData('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductBasicInfoForm;
