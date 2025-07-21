
import { TemplateBlock } from '@/types/template';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MediaSelector from './MediaSelector';

interface HeroEditorProps {
  block: TemplateBlock;
  onUpdate: (key: string, value: any) => void;
  onMediaSelect: (url: string, type: 'image' | 'video' | 'file', fieldKey: string) => void;
}

const HeroEditor = ({ block, onUpdate, onMediaSelect }: HeroEditorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={block.content.title || ''}
          onChange={(e) => onUpdate('title', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="subtitle">Sous-titre</Label>
        <Input
          id="subtitle"
          value={block.content.subtitle || ''}
          onChange={(e) => onUpdate('subtitle', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="buttonText">Texte du bouton</Label>
        <Input
          id="buttonText"
          value={block.content.buttonText || ''}
          onChange={(e) => onUpdate('buttonText', e.target.value)}
        />
      </div>
      <MediaSelector
        fieldKey="backgroundImage"
        label="Image de fond"
        currentValue={block.content.backgroundImage || ''}
        acceptedTypes="image/*,video/*"
        onMediaSelect={onMediaSelect}
      />
      <div>
        <Label>Type de média</Label>
        <Select 
          value={block.content.mediaType || 'image'} 
          onValueChange={(value) => onUpdate('mediaType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Vidéo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default HeroEditor;
