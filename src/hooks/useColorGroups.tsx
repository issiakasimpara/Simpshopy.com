import { useState, useCallback } from 'react';
import { Template, ColorGroup, TemplateBlock } from '@/types/template';

interface UseColorGroupsProps {
  template: Template;
  onTemplateUpdate: (template: Template) => void;
}

export const useColorGroups = ({ template, onTemplateUpdate }: UseColorGroupsProps) => {
  const [colorGroups, setColorGroups] = useState<{ [key: string]: ColorGroup }>(
    template.colorGroups || {}
  );

  // Générer un nom automatique pour un groupe de couleurs
  const generateAutoName = useCallback(() => {
    const existingNames = Object.values(colorGroups).map(group => group.name);
    let counter = 1;
    let name = `Groupe de couleurs ${counter}`;
    
    while (existingNames.includes(name)) {
      counter++;
      name = `Groupe de couleurs ${counter}`;
    }
    
    return name;
  }, [colorGroups]);

  // Créer un nouveau groupe de couleurs
  const createColorGroup = useCallback((styles: TemplateBlock['styles'], customName?: string) => {
    const id = `color-group-${Date.now()}`;
    const name = customName || generateAutoName();
    
    const newGroup: ColorGroup = {
      id,
      name,
      styles: {
        backgroundColor: styles.backgroundColor,
        textColor: styles.textColor,
        padding: styles.padding,
        margin: styles.margin
      },
      createdAt: new Date().toISOString()
    };

    const updatedGroups = {
      ...colorGroups,
      [id]: newGroup
    };

    setColorGroups(updatedGroups);
    
    // Mettre à jour le template
    const updatedTemplate = {
      ...template,
      colorGroups: updatedGroups
    };
    
    onTemplateUpdate(updatedTemplate);
    
    return newGroup;
  }, [colorGroups, generateAutoName, template, onTemplateUpdate]);

  // Appliquer un groupe de couleurs à un bloc
  const applyColorGroupToBlock = useCallback((blockId: string, colorGroupId: string) => {
    const colorGroup = colorGroups[colorGroupId];
    if (!colorGroup) return;

    // Trouver le bloc dans toutes les pages
    const updatedPages = { ...template.pages };
    
    Object.keys(updatedPages).forEach(pageKey => {
      updatedPages[pageKey] = updatedPages[pageKey].map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            styles: {
              ...block.styles,
              backgroundColor: colorGroup.styles.backgroundColor,
              textColor: colorGroup.styles.textColor,
              padding: colorGroup.styles.padding,
              margin: colorGroup.styles.margin
            },
            colorGroupId: colorGroupId
          };
        }
        return block;
      });
    });

    const updatedTemplate = {
      ...template,
      pages: updatedPages
    };
    
    onTemplateUpdate(updatedTemplate);
  }, [colorGroups, template, onTemplateUpdate]);

  // Réinitialiser un bloc aux couleurs globales
  const resetBlockToGlobalColors = useCallback((blockId: string) => {
    const updatedPages = { ...template.pages };
    
    Object.keys(updatedPages).forEach(pageKey => {
      updatedPages[pageKey] = updatedPages[pageKey].map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            styles: {
              backgroundColor: template.styles.primaryColor,
              textColor: template.styles.secondaryColor,
              padding: block.styles.padding, // Garder le padding/margin existant
              margin: block.styles.margin
            },
            colorGroupId: undefined
          };
        }
        return block;
      });
    });

    const updatedTemplate = {
      ...template,
      pages: updatedPages
    };
    
    onTemplateUpdate(updatedTemplate);
  }, [template, onTemplateUpdate]);

  // Obtenir la liste des groupes de couleurs disponibles
  const getAvailableColorGroups = useCallback(() => {
    return Object.values(colorGroups);
  }, [colorGroups]);

  // Supprimer un groupe de couleurs
  const deleteColorGroup = useCallback((colorGroupId: string) => {
    const updatedGroups = { ...colorGroups };
    delete updatedGroups[colorGroupId];
    
    setColorGroups(updatedGroups);
    
    // Mettre à jour le template
    const updatedTemplate = {
      ...template,
      colorGroups: updatedGroups
    };
    
    onTemplateUpdate(updatedTemplate);
  }, [colorGroups, template, onTemplateUpdate]);

  return {
    colorGroups,
    createColorGroup,
    applyColorGroupToBlock,
    resetBlockToGlobalColors,
    getAvailableColorGroups,
    deleteColorGroup,
    generateAutoName
  };
};
