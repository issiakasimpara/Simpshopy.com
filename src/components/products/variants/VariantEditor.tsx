
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Image as ImageIcon, Package, Settings, Save } from 'lucide-react';
import ProductImageManager from '../ProductImageManager';

interface VariantEditorProps {
  variant: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (variantData: any) => void;
  productName?: string;
}

const VariantEditor = ({ variant, open, onOpenChange, onSave, productName }: VariantEditorProps) => {
  const [formData, setFormData] = useState({
    sku: '',
    price: '',
    compare_price: '',
    cost_price: '',
    inventory_quantity: '',
    weight: '',
    images: [] as string[]
  });

  useEffect(() => {
    if (variant) {
      setFormData({
        sku: variant.sku || '',
        price: variant.price?.toString() || '',
        compare_price: variant.compare_price?.toString() || '',
        cost_price: variant.cost_price?.toString() || '',
        inventory_quantity: variant.inventory_quantity?.toString() || '',
        weight: variant.weight?.toString() || '',
        images: variant.images || []
      });
    }
  }, [variant]);

  const handleSave = () => {
    const updatedVariant = {
      ...variant,
      sku: formData.sku,
      price: formData.price ? parseFloat(formData.price) : null,
      compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      inventory_quantity: formData.inventory_quantity ? parseInt(formData.inventory_quantity) : 0,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      images: formData.images
    };
    
    onSave(updatedVariant);
    onOpenChange(false);
  };

  const getVariantDisplayName = () => {
    const attributeNames = variant?.variant_attribute_values
      ?.map((vav: any) => vav.attribute_values?.value)
      .filter(Boolean)
      .join(' / ') || 'Variante';
    
    return attributeNames;
  };

  const generateSKU = () => {
    if (!productName) return;
    
    const attributes = variant?.variant_attribute_values
      ?.map((vav: any) => vav.attribute_values?.value)
      .filter(Boolean) || [];
    
    // Logique simplifiée de génération de SKU côté client
    const baseProduct = productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
    const attributePart = attributes.join('').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const randomPart = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    const generatedSKU = `${baseProduct}-${attributePart}-${randomPart}`;
    setFormData(prev => ({ ...prev, sku: generatedSKU }));
  };

  if (!variant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Modifier la variante : {getVariantDisplayName()}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            {/* Attributs de la variante */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Attributs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {variant.variant_attribute_values?.map((vav: any, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      {vav.attribute_values?.hex_color && (
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: vav.attribute_values.hex_color }}
                        />
                      )}
                      {vav.attribute_values?.value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SKU */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Code produit (SKU)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="SKU de la variante"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSKU}
                  >
                    Générer
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Le SKU doit être unique pour chaque variante
                </p>
              </CardContent>
            </Card>

            {/* Prix */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Prix et coûts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Prix de vente (CFA) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="compare_price">Prix comparé (CFA)</Label>
                    <Input
                      id="compare_price"
                      type="number"
                      step="0.01"
                      value={formData.compare_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, compare_price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost_price">Prix de revient (CFA)</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost_price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock et poids */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stock et expédition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inventory_quantity">Quantité en stock</Label>
                    <Input
                      id="inventory_quantity"
                      type="number"
                      value={formData.inventory_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, inventory_quantity: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Poids (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Images de la variante</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductImageManager
                  images={formData.images}
                  onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 Ces images seront affichées spécifiquement pour cette variante. 
                    Si aucune image n'est définie, les images du produit principal seront utilisées.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VariantEditor;
