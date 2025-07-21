
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Wand2 } from 'lucide-react';
import AttributeSelector from './AttributeSelector';
import type { CheckedState } from '@radix-ui/react-checkbox';

interface VariantCreationFormProps {
  newVariant: {
    price: string;
    inventory_quantity: string;
    selectedAttributes: Record<string, string[]>;
  };
  onNewVariantChange: (variant: any) => void;
  generateMode: boolean;
  onGenerateModeChange: (checked: CheckedState) => void;
  colorAttribute?: any;
  sizeAttribute?: any;
  onAttributeChange: (attributeId: string, valueId: string, checked: CheckedState) => void;
  onCreateVariant: () => void;
  onGenerateAllCombinations: () => void;
  productId?: string;
}

const VariantCreationForm = ({
  newVariant,
  onNewVariantChange,
  generateMode,
  onGenerateModeChange,
  colorAttribute,
  sizeAttribute,
  onAttributeChange,
  onCreateVariant,
  onGenerateAllCombinations,
  productId
}: VariantCreationFormProps) => {
  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Créer des variantes</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="generateMode"
            checked={generateMode}
            onCheckedChange={onGenerateModeChange}
          />
          <Label htmlFor="generateMode" className="text-sm">Mode génération automatique</Label>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="variant-price">Prix (CFA) *</Label>
          <Input
            id="variant-price"
            type="number"
            step="0.01"
            value={newVariant.price}
            onChange={(e) => onNewVariantChange({ ...newVariant, price: e.target.value })}
            placeholder="Prix de la variante"
          />
        </div>
        
        <div>
          <Label htmlFor="variant-stock">Stock</Label>
          <Input
            id="variant-stock"
            type="number"
            value={newVariant.inventory_quantity}
            onChange={(e) => onNewVariantChange({ ...newVariant, inventory_quantity: e.target.value })}
            placeholder="Quantité en stock"
          />
        </div>
      </div>

      <AttributeSelector
        colorAttribute={colorAttribute}
        sizeAttribute={sizeAttribute}
        selectedAttributes={newVariant.selectedAttributes}
        generateMode={generateMode}
        onAttributeChange={onAttributeChange}
      />

      {generateMode ? (
        <Button 
          onClick={onGenerateAllCombinations}
          disabled={!newVariant.price || !productId}
          className="w-full"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Générer toutes les combinaisons (SKU automatiques)
        </Button>
      ) : (
        <Button 
          onClick={onCreateVariant}
          disabled={!newVariant.price || !productId}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter la variante (SKU automatique)
        </Button>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>🔧 Les SKU sont générés automatiquement basés sur le nom du produit et les attributs.</p>
        {generateMode && (
          <p>💡 Le mode génération automatique créera une variante pour chaque combinaison possible.</p>
        )}
      </div>
    </div>
  );
};

export default VariantCreationForm;
