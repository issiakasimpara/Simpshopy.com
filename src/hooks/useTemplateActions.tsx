import { useCallback } from 'react';
import { Template } from '@/types/template';
import { useToast } from '@/hooks/use-toast';
import { validateStoreAccess } from '@/utils/validation';
import { logger } from '@/utils/logger';

interface UseTemplateActionsProps {
  selectedStore: any;
  templateData: Template;
  setHasUnsavedChanges: (value: boolean) => void;
  setShowPreview: (value: boolean) => void;
  saveTemplate: (store_id: string, template_id: string, template_data: any, is_published?: boolean) => Promise<string>;
}

export const useTemplateActions = ({
  selectedStore,
  templateData,
  setHasUnsavedChanges,
  setShowPreview,
  saveTemplate
}: UseTemplateActionsProps) => {
  const { toast } = useToast();

  const handleSave = useCallback(async (silent = false) => {
    logger.debug('handleSave called', {
      selectedStore: selectedStore?.id,
      templateId: templateData.id,
      silent
    }, 'useTemplateActions');

    if (!selectedStore?.id) {
      console.error('❌ No selectedStore found for save');
      toast({
        title: "Erreur de sauvegarde",
        description: "Aucune boutique trouvée. Veuillez créer une boutique d'abord ou rafraîchir la page.",
        variant: "destructive"
      });
      return;
    }

    // Valider que le store est accessible
    const isStoreValid = await validateStoreAccess(selectedStore.id);
    if (!isStoreValid) {
      console.error('❌ Store not accessible:', selectedStore.id);
      toast({
        title: "Erreur de sauvegarde",
        description: "La boutique n'est pas accessible. Veuillez vérifier votre connexion ou rafraîchir la page.",
        variant: "destructive"
      });
      return;
    }

    try {
      logger.info('Saving template', {
        storeId: selectedStore.id,
        templateId: templateData.id,
        isPublished: false
      }, 'useTemplateActions');

      await saveTemplate(selectedStore.id, templateData.id, templateData, false);
      setHasUnsavedChanges(false);

      if (!silent) {
        toast({
          title: "Template sauvegardé",
          description: "Vos personnalisations ont été enregistrées avec succès.",
        });
      }

      logger.info('Template saved successfully', { storeId: selectedStore.id, templateId: templateData.id }, 'useTemplateActions');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder vos modifications.",
        variant: "destructive"
      });
    }
  }, [selectedStore?.id, templateData, saveTemplate, setHasUnsavedChanges, toast]);

  const handlePreview = useCallback(() => {
    // Ouvrir l'aperçu
    setShowPreview(true);

    toast({
      title: "Aperçu ouvert",
      description: "L'aperçu reflète vos modifications en temps réel.",
    });
  }, [setShowPreview, toast]);

  const handlePublish = useCallback(async () => {
    logger.debug('handlePublish called', {
      selectedStore: selectedStore?.id,
      templateId: templateData.id
    }, 'useTemplateActions');

    if (!selectedStore?.id) {
      console.error('❌ No selectedStore found for publish');
      toast({
        title: "Erreur de publication",
        description: "Aucune boutique trouvée. Veuillez créer une boutique d'abord ou rafraîchir la page.",
        variant: "destructive"
      });
      return;
    }

    // Valider que le store est accessible
    const isStoreValid = await validateStoreAccess(selectedStore.id);
    if (!isStoreValid) {
      console.error('❌ Store not accessible for publish:', selectedStore.id);
      toast({
        title: "Erreur de publication",
        description: "La boutique n'est pas accessible. Veuillez vérifier votre connexion ou rafraîchir la page.",
        variant: "destructive"
      });
      return;
    }

    try {
      logger.info('Publishing template', {
        storeId: selectedStore.id,
        templateId: templateData.id,
        isPublished: true
      }, 'useTemplateActions');

      await saveTemplate(selectedStore.id, templateData.id, templateData, true);
      setHasUnsavedChanges(false);

      toast({
        title: "Site publié",
        description: "Votre site est maintenant en ligne avec toutes vos modifications !",
      });

      logger.info('Template published successfully', { storeId: selectedStore.id, templateId: templateData.id }, 'useTemplateActions');
    } catch (error) {
      console.error('❌ Erreur lors de la publication:', error);
      toast({
        title: "Erreur de publication",
        description: "Impossible de publier votre site.",
        variant: "destructive"
      });
    }
  }, [selectedStore?.id, templateData, saveTemplate, setHasUnsavedChanges, toast]);

  return {
    handleSave,
    handlePreview,
    handlePublish,
  };
};