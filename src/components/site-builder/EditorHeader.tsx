
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Save, 
  Eye, 
  Upload,
  Undo2,
  Redo2
} from 'lucide-react';

interface EditorHeaderProps {
  templateName: string;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  hasUnsavedChanges: boolean;
  isSaving?: boolean;
  // Nouvelles props pour l'historique
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Nouvelle prop pour le store
  hasStore?: boolean;
}

const EditorHeader = ({
  templateName,
  viewMode,
  onViewModeChange,
  onBack,
  onSave,
  onPreview,
  onPublish,
  hasUnsavedChanges,
  isSaving = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  hasStore = true
}: EditorHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-20">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg">{templateName}</h1>
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="text-xs">
                Non sauvegardé
              </Badge>
            )}
            {!hasStore && (
              <Badge variant="destructive" className="text-xs">
                Aucune boutique
              </Badge>
            )}
          </div>
        </div>

        {/* Center Section - History Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-2"
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center gap-2"
            title="Refaire (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* View Mode Controls */}
          <div className="flex items-center bg-gray-100 rounded-md p-1">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('desktop')}
              className="h-8 w-8 p-0"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('tablet')}
              className="h-8 w-8 p-0"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('mobile')}
              className="h-8 w-8 p-0"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !hasStore}
            className="flex items-center gap-2"
            title={!hasStore ? "Aucune boutique disponible" : ""}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Aperçu
          </Button>

          <Button
            size="sm"
            onClick={onPublish}
            disabled={!hasStore}
            className="flex items-center gap-2"
            title={!hasStore ? "Aucune boutique disponible" : ""}
          >
            <Upload className="h-4 w-4" />
            Publier
          </Button>
        </div>
      </div>
    </header>
  );
};

export default EditorHeader;
