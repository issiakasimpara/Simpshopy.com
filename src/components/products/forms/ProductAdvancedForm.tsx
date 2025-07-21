
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Tag, Package2, Truck } from 'lucide-react';

interface AdvancedFormData {
  tags: string[];
  weight: string;
  comparePrice: string;
  costPrice: string;
  trackInventory: boolean;
  allowBackorders: boolean;
  requiresShipping: boolean;
  seoTitle: string;
  seoDescription: string;
}

interface ProductAdvancedFormProps {
  formData: AdvancedFormData;
  onFormDataChange: (data: AdvancedFormData) => void;
}

const ProductAdvancedForm = ({ formData, onFormDataChange }: ProductAdvancedFormProps) => {
  const [newTag, setNewTag] = React.useState('');

  const updateFormData = (field: keyof AdvancedFormData, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Prix et coûts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Prix et coûts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comparePrice">Prix de comparaison (CFA)</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.comparePrice}
                onChange={(e) => updateFormData('comparePrice', e.target.value)}
                placeholder="Prix barré"
              />
              <p className="text-xs text-muted-foreground">
                Prix affiché barré pour montrer la réduction
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="costPrice">Prix de revient (CFA)</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) => updateFormData('costPrice', e.target.value)}
                placeholder="Coût d'achat"
              />
              <p className="text-xs text-muted-foreground">
                Pour calculer votre marge (non affiché publiquement)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expédition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Expédition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="requiresShipping"
              checked={formData.requiresShipping}
              onCheckedChange={(checked) => updateFormData('requiresShipping', checked)}
            />
            <Label htmlFor="requiresShipping">Ce produit nécessite une expédition</Label>
          </div>
          
          {formData.requiresShipping && (
            <div className="space-y-2">
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={(e) => updateFormData('weight', e.target.value)}
                placeholder="0.0"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestion du stock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestion du stock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="trackInventory"
              checked={formData.trackInventory}
              onCheckedChange={(checked) => updateFormData('trackInventory', checked)}
            />
            <Label htmlFor="trackInventory">Suivre la quantité en stock</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="allowBackorders"
              checked={formData.allowBackorders}
              onCheckedChange={(checked) => updateFormData('allowBackorders', checked)}
            />
            <Label htmlFor="allowBackorders">Autoriser les commandes en rupture</Label>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags et étiquettes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Ajouter un tag..."
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button type="button" onClick={addTag} disabled={!newTag.trim()}>
              Ajouter
            </Button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>Optimisation SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">Titre SEO</Label>
            <Input
              id="seoTitle"
              value={formData.seoTitle}
              onChange={(e) => updateFormData('seoTitle', e.target.value)}
              placeholder="Titre optimisé pour les moteurs de recherche"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {formData.seoTitle.length}/60 caractères
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="seoDescription">Description SEO</Label>
            <Textarea
              id="seoDescription"
              value={formData.seoDescription}
              onChange={(e) => updateFormData('seoDescription', e.target.value)}
              placeholder="Description optimisée pour les moteurs de recherche"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {formData.seoDescription.length}/160 caractères
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductAdvancedForm;
