import React, { useState } from 'react';
import { TemplateBlock } from '@/types/template';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Image, ShoppingBag } from 'lucide-react';

interface CategoriesEditorProps {
  block: TemplateBlock;
  onUpdate: (key: string, value: any) => void;
}

const CategoriesEditor = ({ block, onUpdate }: CategoriesEditorProps) => {
  const [localCategories, setLocalCategories] = useState(block.content.categories || []);

  const addCategory = () => {
    const newCategory = {
      name: 'Nouvelle Catégorie',
      description: 'Description de la catégorie',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      productCount: 0
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
          placeholder="Nos Catégories"
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Sous-titre</Label>
        <Input
          id="subtitle"
          value={block.content.subtitle || ''}
          onChange={(e) => onUpdate('subtitle', e.target.value)}
          placeholder="Trouvez ce qui vous convient"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Catégories</Label>
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
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={category.description}
                    onChange={(e) => updateCategory(categoryIndex, 'description', e.target.value)}
                    placeholder="Description de la catégorie"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={category.image}
                      onChange={(e) => updateCategory(categoryIndex, 'image', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                    <Button size="sm" variant="outline">
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Nombre de produits</Label>
                  <Input
                    type="number"
                    value={category.productCount}
                    onChange={(e) => updateCategory(categoryIndex, 'productCount', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoriesEditor;
