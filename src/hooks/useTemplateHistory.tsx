
import { useState, useCallback } from 'react';
import { Template } from '@/types/template';
import { logger } from '@/utils/logger';

interface UseTemplateHistoryProps {
  initialTemplate: Template;
  onTemplateChange: (template: Template) => void;
}

export const useTemplateHistory = ({ initialTemplate, onTemplateChange }: UseTemplateHistoryProps) => {
  const [history, setHistory] = useState<Template[]>([initialTemplate]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const addToHistory = useCallback((template: Template) => {
    logger.debug('addToHistory appelé', { currentIndex }, 'useTemplateHistory');
    setHistory(prev => {
      // Si on n'est pas à la fin de l'historique, on supprime tout ce qui suit
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(template);
      
      // Limiter l'historique à 50 entrées pour éviter les problèmes de mémoire
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      logger.debug('Nouvel historique créé', { length: newHistory.length }, 'useTemplateHistory');
      return newHistory;
    });
    
    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 1, 49);
      logger.debug('Nouvel index', { newIndex }, 'useTemplateHistory');
      return newIndex;
    });
  }, [currentIndex]);

  const undo = useCallback(() => {
    logger.debug('undo appelé', { canUndo, currentIndex }, 'useTemplateHistory');
    if (canUndo) {
      const newIndex = currentIndex - 1;
      logger.debug('Annulation vers index', { newIndex }, 'useTemplateHistory');
      setCurrentIndex(newIndex);
      onTemplateChange(history[newIndex]);
    }
  }, [canUndo, currentIndex, history, onTemplateChange]);

  const redo = useCallback(() => {
    logger.debug('redo appelé', { canRedo, currentIndex }, 'useTemplateHistory');
    if (canRedo) {
      const newIndex = currentIndex + 1;
      logger.debug('Rétablissement vers index', { newIndex }, 'useTemplateHistory');
      setCurrentIndex(newIndex);
      onTemplateChange(history[newIndex]);
    }
  }, [canRedo, currentIndex, history, onTemplateChange]);

  console.log('État de l\'historique - Index:', currentIndex, 'Longueur:', history.length, 'canUndo:', canUndo, 'canRedo:', canRedo);

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
