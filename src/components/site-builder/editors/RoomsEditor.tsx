import React, { useState } from 'react';
import { TemplateBlock } from '@/types/template';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Image, Home, Star } from 'lucide-react';

interface RoomsEditorProps {
  block: TemplateBlock;
  onUpdate: (key: string, value: any) => void;
}

const RoomsEditor = ({ block, onUpdate }: RoomsEditorProps) => {
  const [localRooms, setLocalRooms] = useState(block.content.rooms || []);

  const addRoom = () => {
    const newRoom = {
      name: 'Nouvelle Pièce',
      description: 'Description de la pièce',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
      productCount: 0
    };
    
    const updatedRooms = [...localRooms, newRoom];
    setLocalRooms(updatedRooms);
    onUpdate('rooms', updatedRooms);
  };

  const updateRoom = (index: number, field: string, value: any) => {
    const updatedRooms = [...localRooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setLocalRooms(updatedRooms);
    onUpdate('rooms', updatedRooms);
  };

  const removeRoom = (index: number) => {
    const updatedRooms = localRooms.filter((_, i) => i !== index);
    setLocalRooms(updatedRooms);
    onUpdate('rooms', updatedRooms);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Titre principal</Label>
        <Input
          id="title"
          value={block.content.title || ''}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="Par Pièce"
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Sous-titre</Label>
        <Input
          id="subtitle"
          value={block.content.subtitle || ''}
          onChange={(e) => onUpdate('subtitle', e.target.value)}
          placeholder="Décorez chaque espace"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Pièces</Label>
          <Button size="sm" onClick={addRoom} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une pièce
          </Button>
        </div>

        {localRooms.map((room, roomIndex) => (
          <Card key={roomIndex} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Input
                  value={room.name}
                  onChange={(e) => updateRoom(roomIndex, 'name', e.target.value)}
                  className="font-semibold"
                  placeholder="Nom de la pièce"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRoom(roomIndex)}
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
                    value={room.description}
                    onChange={(e) => updateRoom(roomIndex, 'description', e.target.value)}
                    placeholder="Description de la pièce"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={room.image}
                      onChange={(e) => updateRoom(roomIndex, 'image', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                    <Button size="sm" variant="outline">
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Nombre d'articles</Label>
                  <Input
                    type="number"
                    value={room.productCount}
                    onChange={(e) => updateRoom(roomIndex, 'productCount', parseInt(e.target.value) || 0)}
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

export default RoomsEditor;
