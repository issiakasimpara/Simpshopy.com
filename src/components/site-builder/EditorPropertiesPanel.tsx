
import { TemplateBlock } from '@/types/template';
import { Button } from '@/components/ui/button';
import { X, Palette } from 'lucide-react';
import HeroEditor from './editors/HeroEditor';
import ProductsEditor from './editors/ProductsEditor';
import TextImageEditor from './editors/TextImageEditor';
import TextVideoEditor from './editors/TextVideoEditor';
import ContactEditor from './editors/ContactEditor';
import GalleryEditor from './editors/GalleryEditor';
import VideoEditor from './editors/VideoEditor';
import FooterEditor from './editors/FooterEditor';
import FeaturesEditor from './editors/FeaturesEditor';
import TestimonialsEditor from './editors/TestimonialsEditor';
import FAQEditor from './editors/FAQEditor';
import BeforeAfterEditor from './editors/BeforeAfterEditor';
import ComparisonEditor from './editors/ComparisonEditor';
import GuaranteesEditor from './editors/GuaranteesEditor';
import AnnouncementBarEditor from './editors/AnnouncementBarEditor';
import BrandingEditor from './editors/BrandingEditor';
import StylePanel from './StylePanel';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'stores'>;

interface EditorPropertiesPanelProps {
  selectedBlock: TemplateBlock;
  showStylePanel: boolean;
  onToggleStylePanel: () => void;
  onBlockUpdate: (block: TemplateBlock) => void;
  onClose?: () => void;
  selectedStore?: Store | null;
}

const EditorPropertiesPanel = ({
  selectedBlock,
  showStylePanel,
  onToggleStylePanel,
  onBlockUpdate,
  onClose,
  selectedStore
}: EditorPropertiesPanelProps) => {
  const handleUpdate = (key: string, value: any) => {
    const updatedBlock = {
      ...selectedBlock,
      content: {
        ...selectedBlock.content,
        [key]: value,
      },
    };
    onBlockUpdate(updatedBlock);
  };

  const handleStyleUpdate = (styles: any) => {
    const updatedBlock = {
      ...selectedBlock,
      styles: {
        ...selectedBlock.styles,
        ...styles,
      },
    };
    onBlockUpdate(updatedBlock);
  };

  const handleMediaSelect = (url: string, type: 'image' | 'video' | 'file', fieldKey: string) => {
    handleUpdate(fieldKey, url);
  };

  const renderEditor = () => {
    switch (selectedBlock.type) {
      case 'announcement':
        return <AnnouncementBarEditor block={selectedBlock} onUpdate={handleUpdate} />;
      case 'branding':
        return <BrandingEditor block={selectedBlock} onUpdate={handleUpdate} />;
      case 'hero':
        return <HeroEditor block={selectedBlock} onUpdate={handleUpdate} onMediaSelect={handleMediaSelect} />;
      case 'products':
        return <ProductsEditor block={selectedBlock} onUpdate={handleUpdate} selectedStore={selectedStore} />;
      case 'text-image':
        return <TextImageEditor block={selectedBlock} onUpdate={handleUpdate} onMediaSelect={handleMediaSelect} />;
      case 'text-video':
        return <TextVideoEditor block={selectedBlock} onUpdate={handleUpdate} onMediaSelect={handleMediaSelect} />;
      case 'contact':
        return <ContactEditor block={selectedBlock} onUpdate={handleUpdate} />;
      case 'gallery':
        return <GalleryEditor block={selectedBlock} onUpdate={handleUpdate} onMediaSelect={handleMediaSelect} />;
      case 'video':
        return <VideoEditor block={selectedBlock} onUpdate={handleUpdate} onMediaSelect={handleMediaSelect} />;
      case 'footer':
        return <FooterEditor block={selectedBlock} onUpdate={handleUpdate} />;
      case 'features':
        return <FeaturesEditor block={selectedBlock} onUpdate={handleUpdate} />;
      case 'testimonials':
        return <TestimonialsEditor block={selectedBlock} onUpdate={handleUpdate} />;
      case 'faq':
        return <FAQEditor block={selectedBlock} onUpdate={handleUpdate} />;
      case 'before-after':
        return <BeforeAfterEditor block={selectedBlock} onUpdate={handleUpdate} onMediaSelect={handleMediaSelect} />;
      case 'comparison':
        return <ComparisonEditor block={selectedBlock} onUpdate={handleUpdate} />;
      case 'guarantees':
        return <GuaranteesEditor block={selectedBlock} onUpdate={handleUpdate} />;
      default:
        return <div className="p-4 text-gray-500">Aucun éditeur disponible pour ce type de bloc</div>;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 mt-20 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Propriétés du bloc</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleStylePanel}
            className={showStylePanel ? 'bg-blue-50' : ''}
          >
            <Palette className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {showStylePanel ? (
          <StylePanel
            block={selectedBlock}
            onUpdate={onBlockUpdate}
          />
        ) : (
          renderEditor()
        )}
      </div>
    </div>
  );
};

export default EditorPropertiesPanel;
