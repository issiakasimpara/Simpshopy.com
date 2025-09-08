
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TemplateBlock, Template } from '@/types/template';
import { useState } from 'react';
import { RotateCcw, Palette, Save } from 'lucide-react';
import { useColorGroups } from '@/hooks/useColorGroups';

interface StylePanelProps {
  block: TemplateBlock;
  onUpdate: (block: TemplateBlock) => void;
  template?: Template;
  onTemplateUpdate?: (template: Template) => void;
}

const StylePanel = ({ block, onUpdate, template, onTemplateUpdate }: StylePanelProps) => {
  const [localBlock, setLocalBlock] = useState(block);
  const [showColorGroupName, setShowColorGroupName] = useState(false);
  const [colorGroupName, setColorGroupName] = useState('');
  const [showExistingGroups, setShowExistingGroups] = useState(false);

  const { 
    createColorGroup, 
    applyColorGroupToBlock, 
    resetBlockToGlobalColors, 
    getAvailableColorGroups 
  } = useColorGroups({ 
    template: template!, 
    onTemplateUpdate: onTemplateUpdate! 
  });

  const updateStyles = (styleUpdates: Partial<TemplateBlock['styles']>) => {
    const updatedBlock = {
      ...localBlock,
      styles: { ...localBlock.styles, ...styleUpdates }
    };
    setLocalBlock(updatedBlock);
    onUpdate(updatedBlock);
  };

  const handleSaveAsColorGroup = () => {
    if (!template || !onTemplateUpdate) return;
    
    const groupName = colorGroupName.trim() || undefined;
    createColorGroup(localBlock.styles, groupName);
    setShowColorGroupName(false);
    setColorGroupName('');
  };

  const handleApplyExistingGroup = (colorGroupId: string) => {
    if (!template || !onTemplateUpdate) return;
    
    applyColorGroupToBlock(block.id, colorGroupId);
    setShowExistingGroups(false);
  };

  const handleResetToGlobal = () => {
    if (!template || !onTemplateUpdate) return;
    
    resetBlockToGlobalColors(block.id);
  };

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-xs sm:text-sm">Styles du bloc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
        {/* Actions rapides */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={() => setShowExistingGroups(!showExistingGroups)}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <Palette className="h-3 w-3 mr-1" />
              Choisir groupe existant
            </Button>
            <Button
              onClick={handleResetToGlobal}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
          </div>
          
          {showExistingGroups && (
            <div className="border rounded-md p-2 bg-gray-50">
              <div className="text-xs font-medium mb-2">Groupes de couleurs disponibles :</div>
              {getAvailableColorGroups().length > 0 ? (
                <div className="space-y-1">
                  {getAvailableColorGroups().map((group) => (
                    <Button
                      key={group.id}
                      onClick={() => handleApplyExistingGroup(group.id)}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-8"
                    >
                      <div 
                        className="w-4 h-4 rounded mr-2 border"
                        style={{ backgroundColor: group.styles.backgroundColor }}
                      />
                      {group.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">Aucun groupe de couleurs créé</div>
              )}
            </div>
          )}
        </div>

        {/* Couleurs personnalisées */}
        <div>
          <Label htmlFor="backgroundColor" className="text-xs sm:text-sm">Couleur de fond</Label>
          <Input
            id="backgroundColor"
            type="color"
            value={localBlock.styles.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
            className="text-xs sm:text-sm"
          />
        </div>
        
        <div>
          <Label htmlFor="textColor" className="text-xs sm:text-sm">Couleur du texte</Label>
          <Input
            id="textColor"
            type="color"
            value={localBlock.styles.textColor || '#000000'}
            onChange={(e) => updateStyles({ textColor: e.target.value })}
            className="text-xs sm:text-sm"
          />
        </div>
        
        <div>
          <Label htmlFor="padding" className="text-xs sm:text-sm">Espacement interne</Label>
          <Input
            id="padding"
            placeholder="ex: 20px 0"
            value={localBlock.styles.padding || ''}
            onChange={(e) => updateStyles({ padding: e.target.value })}
            className="text-xs sm:text-sm"
          />
        </div>
        
        <div>
          <Label htmlFor="margin" className="text-xs sm:text-sm">Espacement externe</Label>
          <Input
            id="margin"
            placeholder="ex: 10px 0"
            value={localBlock.styles.margin || ''}
            onChange={(e) => updateStyles({ margin: e.target.value })}
            className="text-xs sm:text-sm"
          />
        </div>

        {/* Sauvegarder comme groupe */}
        <div className="pt-2 border-t">
          {!showColorGroupName ? (
            <Button
              onClick={() => setShowColorGroupName(true)}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              Sauvegarder comme groupe de couleurs
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Nom du groupe (optionnel)"
                value={colorGroupName}
                onChange={(e) => setColorGroupName(e.target.value)}
                className="text-xs"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveAsColorGroup}
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Sauvegarder
                </Button>
                <Button
                  onClick={() => {
                    setShowColorGroupName(false);
                    setColorGroupName('');
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StylePanel;
