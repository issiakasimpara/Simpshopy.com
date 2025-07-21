import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  onMethodCreated: () => void;
  editingMethod?: any;
}

const CreateMethodDialog = ({ open, onOpenChange, storeId, onMethodCreated, editingMethod }: CreateMethodDialogProps) => {
  const [name, setName] = useState(editingMethod?.name || '');
  const [description, setDescription] = useState(editingMethod?.description || '');
  const [price, setPrice] = useState(editingMethod?.price?.toString() || '');
  const [deliveryTime, setDeliveryTime] = useState(editingMethod?.delivery_time || '');

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !price || !deliveryTime) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue < 0) {
        throw new Error('Prix invalide');
      }

      if (editingMethod) {
        // Mode édition
        const { error } = await supabase
          .from('shipping_methods')
          .update({
            name: name.trim(),
            description: description.trim() || null,
            price: priceValue,
            estimated_days: deliveryTime.trim(),
            shipping_zone_id: zoneId
          })
          .eq('id', editingMethod.id);

        if (error) {
          console.error('Erreur Supabase:', error);
          throw error;
        }
      } else {
        // Mode création
        const { error } = await supabase
          .from('shipping_methods')
          .insert({
            name: name.trim(),
            description: description.trim() || null,
            price: priceValue,
            estimated_days: deliveryTime.trim(),
            store_id: storeId,
            is_active: true
          });

        if (error) {
          console.error('Erreur Supabase:', error);
          throw error;
        }
      }

      toast({
        title: "Succès",
        description: editingMethod ? "Méthode modifiée avec succès" : "Méthode de livraison créée avec succès"
      });

      // Reset form only if creating new method
      if (!editingMethod) {
        setName('');
        setDescription('');
        setPrice('');
        setDeliveryTime('');
        setZoneId('');
      }

      onMethodCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erreur complète:', error);
      toast({
        title: "Erreur",
        description: error.message || (editingMethod ? "Impossible de modifier la méthode" : "Impossible de créer la méthode"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingMethod ? 'Modifier la méthode de livraison' : 'Créer une méthode de livraison'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la méthode *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Livraison Express"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la méthode de livraison"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix (CFA) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="deliveryTime">Délai de livraison *</Label>
              <Input
                id="deliveryTime"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="Ex: 2-3 jours"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="zone">Zone de livraison *</Label>
            {zones.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Aucune zone de livraison trouvée. Créez d'abord une zone de livraison.
                </p>
              </div>
            ) : (
              <Select value={zoneId} onValueChange={setZoneId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name} ({zone.countries?.length || 0} pays)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || zones.length === 0}
            >
              {isLoading ? 'Création...' : 'Créer la méthode'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMethodDialog;
