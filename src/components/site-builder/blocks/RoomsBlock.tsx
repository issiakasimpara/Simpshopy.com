import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Heart, Star } from 'lucide-react';

interface RoomsBlockProps {
  block: any;
  isEditing?: boolean;
  viewMode?: string;
  onUpdate?: (block: any) => void;
}

const RoomsBlock: React.FC<RoomsBlockProps> = ({ 
  block, 
  isEditing = false, 
  viewMode = 'desktop',
  onUpdate 
}) => {
  const { content, styles } = block;
  const { title, subtitle, rooms } = content;

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: styles?.backgroundColor || '#f8fafc',
        color: styles?.textColor || '#000000',
        padding: styles?.padding || '80px 0'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="h-10 w-10 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg opacity-80">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms?.map((room: any, index: number) => (
            <Card key={index} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={room.image} 
                  alt={room.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-orange-500 text-white border-0">
                    <Heart className="h-3 w-3 mr-1" />
                    Populaire
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-xl mb-2">{room.name}</h3>
                  <p className="text-white/90 text-sm">{room.description}</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-gray-600">{room.productCount} articles</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-500">4.8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 inline-block">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-gray-800">Décoration Personnalisée</span>
            </div>
            <p className="text-sm text-gray-600">
              Créez l'ambiance parfaite dans chaque pièce avec nos conseils d'experts
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomsBlock;
