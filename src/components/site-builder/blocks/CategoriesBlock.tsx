import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, ShoppingBag, TrendingUp } from 'lucide-react';

interface CategoriesBlockProps {
  block: any;
  isEditing?: boolean;
  viewMode?: string;
  onUpdate?: (block: any) => void;
}

const CategoriesBlock: React.FC<CategoriesBlockProps> = ({ 
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
        backgroundColor: styles?.backgroundColor || '#ffffff',
        color: styles?.textColor || '#000000',
        padding: styles?.padding || '80px 0'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg opacity-80">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories?.map((category: any, index: number) => (
            <Card key={index} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-xl mb-2">{category.name}</h3>
                  <p className="text-white/90 text-sm">{category.description}</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">{category.productCount} produits</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Populaire
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 inline-block">
            <p className="text-sm text-gray-600">
              💡 Découvrez nos nouvelles catégories et trouvez exactement ce que vous cherchez
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesBlock;
