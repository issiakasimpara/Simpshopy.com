
import { useParams, useNavigate } from 'react-router-dom';
import { useOptimizedTemplateLoader } from '@/hooks/useOptimizedTemplateLoader';
import { useToast } from '@/hooks/use-toast';
import EditorLoadingState from './EditorLoadingState';
import TemplateEditor from './TemplateEditor';

const OptimizedTemplateEditor = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    template,
    loadingState,
    selectedStore,
    isReady
  } = useOptimizedTemplateLoader(templateId || '');

  const handleBack = () => {
    // Retourner vers l'onglet Ma boutique (configuration) au lieu du site-builder
    navigate('/store-config');
  };

  // Show loading state with optimized UI
  if (loadingState.isLoading) {
    return (
      <EditorLoadingState 
        currentStep={loadingState.currentStep}
        progress={loadingState.progress}
      />
    );
  }

  // Handle errors with better UX
  if (loadingState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-red-950 dark:to-pink-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border-0 p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {loadingState.error}
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleBack}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Retour aux templates
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ready to render editor
  if (isReady && template) {
    return (
      <TemplateEditor 
        template={template}
        onBack={handleBack}
      />
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Initialisation...</p>
      </div>
    </div>
  );
};

export default OptimizedTemplateEditor;
