import React, { useState } from 'react';
import { TemplateBlock } from '@/types/template';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Star, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MenuEditorProps {
  block: TemplateBlock;
  onUpdate: (key: string, value: any) => void;
}

const MenuEditor = ({ block, onUpdate }: MenuEditorProps) => {
  const [localCategories, setLocalCategories] = useState(block.content.categories || []);

  const addCategory = () => {
    const newCategory = {
      name: 'Nouvelle Catégorie',
      items: [
        { name: 'Nouveau Plat', description: 'Description du plat', price: '12€' }
      ]
    };
    
    const updatedCategories = [...localCategories, newCategory];
    setLocalCategories(updatedCategories);
    onUpdate('categories', updatedCategories);
  };

  const updateCategory = (index: number, field: string, value: any) => {
    const updatedCategories = [...localCategories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setLocalCategories(updatedCategories);
    onUpdate('categories', updatedCategories);
  };

  const addItem = (categoryIndex: number) => {
    const updatedCategories = [...localCategories];
    const category = updatedCategories[categoryIndex];
    const newItem = {
      name: 'Nouveau Plat',
      description: 'Description du plat',
      price: '12€'
    };
    category.items.push(newItem);
    setLocalCategories(updatedCategories);
    onUpdate('categories', updatedCategories);
  };

  const updateItem = (categoryIndex: number, itemIndex: number, field: string, value: string) => {
    const updatedCategories = [...localCategories];
    updatedCategories[categoryIndex].items[itemIndex] = {
      ...updatedCategories[categoryIndex].items[itemIndex],
      [field]: value
    };
    setLocalCategories(updatedCategories);
    onUpdate('categories', updatedCategories);
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const updatedCategories = [...localCategories];
    updatedCategories[categoryIndex].items.splice(itemIndex, 1);
    setLocalCategories(updatedCategories);
    onUpdate('categories', updatedCategories);
  };

  const removeCategory = (index: number) => {
    const updatedCategories = localCategories.filter((_, i) => i !== index);
    setLocalCategories(updatedCategories);
    onUpdate('categories', updatedCategories);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Titre principal</Label>
        <Input
          id="title"
          value={block.content.title || ''}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="Notre Carte"
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Sous-titre</Label>
        <Input
          id="subtitle"
          value={block.content.subtitle || ''}
          onChange={(e) => onUpdate('subtitle', e.target.value)}
          placeholder="Découvrez nos spécialités"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Catégories de plats</Label>
          <Button size="sm" onClick={addCategory} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une catégorie
          </Button>
        </div>

        {localCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Input
                  value={category.name}
                  onChange={(e) => updateCategory(categoryIndex, 'name', e.target.value)}
                  className="font-semibold"
                  placeholder="Nom de la catégorie"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCategory(categoryIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Plats</Label>
                  <Button size="sm" onClick={() => addItem(categoryIndex)} className="flex items-center gap-2">
                    <Plus className="h-3 w-3" />
                    Ajouter un plat
                  </Button>
                </div>

                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Plat {itemIndex + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(categoryIndex, itemIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label>Nom du plat</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(categoryIndex, itemIndex, 'name', e.target.value)}
                          placeholder="Nom du plat"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(categoryIndex, itemIndex, 'description', e.target.value)}
                          placeholder="Description du plat"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Prix</Label>
                        <Input
                          value={item.price}
                          onChange={(e) => updateItem(categoryIndex, itemIndex, 'price', e.target.value)}
                          placeholder="12€"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Label>Horaires d'ouverture</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Lundi - Samedi</Label>
            <Input
              value={block.content.openingHours?.weekdays || ''}
              onChange={(e) => onUpdate('openingHours', { ...block.content.openingHours, weekdays: e.target.value })}
              placeholder="12h00 - 14h30 / 19h00 - 22h30"
            />
          </div>
          <div>
            <Label>Dimanche</Label>
            <Input
              value={block.content.openingHours?.sunday || ''}
              onChange={(e) => onUpdate('openingHours', { ...block.content.openingHours, sunday: e.target.value })}
              placeholder="12h00 - 15h00"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuEditor;
