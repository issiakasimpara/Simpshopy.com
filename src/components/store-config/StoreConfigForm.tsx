
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'stores'>;

interface StoreConfigFormProps {
  selectedStore: Store;
  formData: {
    name: string;
    description: string;
    domain: string;
    status: 'draft' | 'active' | 'suspended';
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
}

const StoreConfigForm = ({ 
  selectedStore, 
  formData, 
  onFormDataChange, 
  onSubmit, 
  isUpdating 
}: StoreConfigFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
        <CardDescription>
          Modifiez les informations de base de votre boutique
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la boutique *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ma Boutique"
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'draft' | 'active' | 'suspended') => onFormDataChange(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="active">En ligne</SelectItem>
                  <SelectItem value="suspended">Suspendue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onFormDataChange(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de votre boutique..."
              rows={3}
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="domain">Domaine personnalisé</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => onFormDataChange(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="mondomaine.com"
              className="focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-muted-foreground">
              Laissez vide pour utiliser le sous-domaine par défaut
            </p>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isUpdating} className="px-6">
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StoreConfigForm;
