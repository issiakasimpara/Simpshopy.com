import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Sparkles } from 'lucide-react';

interface RoutinesBlockProps {
  block: any;
  isEditing?: boolean;
  viewMode?: string;
  onUpdate?: (block: any) => void;
}

const RoutinesBlock: React.FC<RoutinesBlockProps> = ({ 
  block, 
  isEditing = false, 
  viewMode = 'desktop',
  onUpdate 
}) => {
  const { content, styles } = block;
  const { title, subtitle, routines } = content;

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: styles?.backgroundColor || '#fdf2f8',
        color: styles?.textColor || '#831843',
        padding: styles?.padding || '80px 0'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg opacity-80">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {routines?.map((routine: any, index: number) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle className="text-xl font-bold">{routine.title}</CardTitle>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{routine.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{routine.skinType}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {routine.steps?.map((step: any, stepIndex: number) => (
                    <div key={stepIndex} className="flex items-start gap-3">
                      <Badge className="bg-pink-100 text-pink-800 border-0">
                        {step.step}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{step.action}</h4>
                        <p className="text-xs text-gray-600">{step.product}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm opacity-70">
            💡 Conseil : Adaptez ces routines à votre type de peau et vos besoins spécifiques
          </p>
        </div>
      </div>
    </section>
  );
};

export default RoutinesBlock;
