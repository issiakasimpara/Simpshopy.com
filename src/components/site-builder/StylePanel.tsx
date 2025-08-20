
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TemplateBlock } from '@/types/template';
import { useState } from 'react';

interface StylePanelProps {
  block: TemplateBlock;
  onUpdate: (block: TemplateBlock) => void;
}

const StylePanel = ({ block, onUpdate }: StylePanelProps) => {
  const [localBlock, setLocalBlock] = useState(block);

  const updateStyles = (styleUpdates: Partial<TemplateBlock['styles']>) => {
    const updatedBlock = {
      ...localBlock,
      styles: { ...localBlock.styles, ...styleUpdates }
    };
    setLocalBlock(updatedBlock);
    onUpdate(updatedBlock);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Styles du bloc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="backgroundColor">Couleur de fond</Label>
          <Input
            id="backgroundColor"
            type="color"
            value={localBlock.styles.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="textColor">Couleur du texte</Label>
          <Input
            id="textColor"
            type="color"
            value={localBlock.styles.textColor || '#000000'}
            onChange={(e) => updateStyles({ textColor: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="padding">Espacement interne</Label>
          <Input
            id="padding"
            placeholder="ex: 20px 0"
            value={localBlock.styles.padding || ''}
            onChange={(e) => updateStyles({ padding: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="margin">Espacement externe</Label>
          <Input
            id="margin"
            placeholder="ex: 10px 0"
            value={localBlock.styles.margin || ''}
            onChange={(e) => updateStyles({ margin: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StylePanel;
