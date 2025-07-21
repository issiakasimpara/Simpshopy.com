import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Truck, DollarSign, Clock } from 'lucide-react';
import { ShippingMethodInsert, ShippingZone, SHIPPING_ICONS } from '@/types/shipping';

interface CreateShippingMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  zones: ShippingZone[];
  onMethodCreated: (method: ShippingMethodInsert) => void;
}

const CreateShippingMethodModal = ({
  open,
  onOpenChange,
  storeId,
  zones,
  onMethodCreated
}: CreateShippingMethodModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦',
    price: '',
    free_shipping_threshold: '',
    estimated_days: '3-5 jours ouvrables',
    shipping_zone_id: '',
    is_active: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const methodData: ShippingMethodInsert = {
        store_id: storeId,
        name: formData.name,
        description: formData.description || undefined,
        icon: formData.icon,
        price: parseFloat(formData.price) || 0,
        free_shipping_threshold: formData.free_shipping_threshold 
          ? parseFloat(formData.free_shipping_threshold) 
          : undefined,
        estimated_days: formData.estimated_days,
        shipping_zone_id: formData.shipping_zone_id || undefined,
        is_active: formData.is_active,
        sort_order: 0
      };

      onMethodCreated(methodData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        icon: '📦',
        price: '',
        free_shipping_threshold: '',
        estimated_days: '3-5 jours ouvrables',
        shipping_zone_id: '',
        is_active: true
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Créer une méthode de livraison
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la méthode *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Livraison Standard"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icône</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIPPING_ICONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon.value}</span>
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la méthode de livraison"
                rows={3}
              />
            </div>
          </div>

          {/* Zone de livraison */}
          <div className="space-y-2">
            <Label htmlFor="zone">Zone de livraison (optionnel)</Label>
            <Select 
              value={formData.shipping_zone_id} 
              onValueChange={(value) => setFormData({ ...formData, shipping_zone_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une zone (global si vide)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Méthode globale (tous pays)</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name} ({zone.countries.length} pays)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prix et seuils */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Prix (CFA) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Seuil livraison gratuite (CFA)</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.free_shipping_threshold}
                  onChange={(e) => setFormData({ ...formData, free_shipping_threshold: e.target.value })}
                  placeholder="Ex: 50000"
                />
              </div>
            </div>
          </div>

          {/* Délai de livraison */}
          <div className="space-y-2">
            <Label htmlFor="estimated_days" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Délai estimé
            </Label>
            <Input
              id="estimated_days"
              value={formData.estimated_days}
              onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
              placeholder="Ex: 3-5 jours ouvrables"
            />
          </div>

          {/* Statut actif */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Méthode active</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isSubmitting ? 'Création...' : 'Créer la méthode'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShippingMethodModal;
