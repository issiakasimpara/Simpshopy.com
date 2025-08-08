import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Utensils, Star, Clock } from 'lucide-react';

interface MenuBlockProps {
  block: any;
  isEditing?: boolean;
  viewMode?: string;
  onUpdate?: (block: any) => void;
}

const MenuBlock: React.FC<MenuBlockProps> = ({ 
  block, 
  isEditing = false, 
  viewMode = 'desktop',
  onUpdate 
}) => {
  const { content, styles } = block;
  const { title, subtitle, categories } = content;

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: styles?.backgroundColor || '#fef3c7',
        color: styles?.textColor || '#92400e',
        padding: styles?.padding || '80px 0'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg opacity-80">{subtitle}</p>
        </div>

        <div className="space-y-12">
          {categories?.map((category: any, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items?.map((item: any, itemIndex: number) => (
                  <Card key={itemIndex} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-2">{item.name}</h4>
                          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-400 fill-current" />
                            <span className="text-xs text-gray-500">Chef's Choice</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-amber-600">{item.price}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-md p-6 inline-block">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="font-semibold">Horaires d'ouverture</span>
            </div>
            <p className="text-sm text-gray-600">
              Lundi - Samedi : 12h00 - 14h30 / 19h00 - 22h30<br />
              Dimanche : 12h00 - 15h00
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenuBlock;
