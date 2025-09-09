
import { TemplateBlock } from '@/types/template';

interface DefaultBlockProps {
  block: TemplateBlock;
  isEditing: boolean;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  onUpdate?: (block: TemplateBlock) => void;
}

const DefaultBlock = ({ block, isEditing, viewMode, onUpdate }: DefaultBlockProps) => {
  const getResponsiveClasses = () => {
    switch (viewMode) {
      case 'mobile':
        return 'text-sm px-2';
      case 'tablet':
        return 'text-base px-4';
      default:
        return 'text-base px-6';
    }
  };

  return (
    <div 
      className={`default-block ${getResponsiveClasses()}`}
      style={{
        '--bg-color': block.styles.backgroundColor || '#F3F4F6',
        '--text-color': block.styles.textColor || '#000000',
        '--padding': block.styles.padding || '4rem 1.5rem'
      } as React.CSSProperties}
    >
      <div className="container mx-auto text-center">
        <h3 className="text-xl font-semibold mb-4">Bloc {block.type}</h3>
        <p className="text-gray-700">Contenu du bloc à personnaliser</p>
      </div>
    </div>
  );
};

export default DefaultBlock;
