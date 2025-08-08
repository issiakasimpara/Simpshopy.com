import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Shield } from 'lucide-react';

interface SportsBlockProps {
  block: any;
  isEditing?: boolean;
  viewMode?: string;
  onUpdate?: (block: any) => void;
}

const SportsBlock: React.FC<SportsBlockProps> = ({ 
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
        backgroundColor: styles?.backgroundColor || '#1e293b',
        color: styles?.textColor || '#ffffff',
        padding: styles?.padding || '80px 0'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg opacity-80">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories?.map((category: any, index: number) => (
            <Card key={index} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 text-white border-0">
                    <Zap className="h-3 w-3 mr-1" />
                    Performance
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-xl mb-2">{category.name}</h3>
                  <p className="text-white/90 text-sm">{category.description}</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">{category.productCount} équipements</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Garantie</span>
                    <Shield className="h-3 w-3 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 inline-block">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-800">Performance Garantie</span>
            </div>
            <p className="text-sm text-gray-600">
              Tous nos équipements sont testés et certifiés pour des performances optimales
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SportsBlock;
