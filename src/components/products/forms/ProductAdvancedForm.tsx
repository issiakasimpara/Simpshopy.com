
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStoreCurrency } from "@/hooks/useStoreCurrency";
import { useStores } from "@/hooks/useStores";

interface ProductAdvancedFormProps {
  data: {
    comparePrice: number;
    costPrice: number;
    weight: number;
    sku: string;
    barcode: string;
    seoTitle: string;
    seoDescription: string;
    metaKeywords: string;
  };
  onChange: (data: any) => void;
  onNext: () => void;
  isLoading?: boolean;
}

const ProductAdvancedForm = ({
  data,
  onChange,
  onNext,
  isLoading = false,
}: ProductAdvancedFormProps) => {
  const { store } = useStores();
  const { formatPrice } = useStoreCurrency(store?.id);

  const handleInputChange = (field: string, value: string | number) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const isFormValid = true; // Tous les champs sont optionnels

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations avancées</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prix et coûts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Prix et coûts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comparePrice">Prix de comparaison ({formatPrice(0, { showSymbol: true, showCode: true })})</Label>
              <Input
                id="comparePrice"
                type="number"
                value={data.comparePrice}
                onChange={(e) => handleInputChange("comparePrice", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Prix barré affiché pour montrer la réduction
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Prix de revient ({formatPrice(0, { showSymbol: true, showCode: true })})</Label>
              <Input
                id="costPrice"
                type="number"
                value={data.costPrice}
                onChange={(e) => handleInputChange("costPrice", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Prix d'achat pour calculer la marge
              </p>
            </div>
          </div>
        </div>

        {/* Expédition */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Expédition</h3>
          <div className="space-y-2">
            <Label htmlFor="weight">Poids (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={data.weight}
              onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Références */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Références</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">Référence produit (SKU)</Label>
              <Input
                id="sku"
                value={data.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="Ex: TSH-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Code-barres</Label>
              <Input
                id="barcode"
                value={data.barcode}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
                placeholder="Ex: 1234567890123"
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Optimisation SEO</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Titre SEO</Label>
              <Input
                id="seoTitle"
                value={data.seoTitle}
                onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                placeholder="Titre optimisé pour les moteurs de recherche"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">Description SEO</Label>
              <Textarea
                id="seoDescription"
                value={data.seoDescription}
                onChange={(e) => handleInputChange("seoDescription", e.target.value)}
                placeholder="Description optimisée pour les moteurs de recherche"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Mots-clés</Label>
              <Input
                id="metaKeywords"
                value={data.metaKeywords}
                onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
                placeholder="mot-clé1, mot-clé2, mot-clé3"
              />
              <p className="text-xs text-muted-foreground">
                Séparez les mots-clés par des virgules
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={!isFormValid || isLoading}
          className="w-full"
        >
          {isLoading ? "Chargement..." : "Suivant"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductAdvancedForm;
