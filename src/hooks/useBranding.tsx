import { useState, useEffect, useMemo } from 'react';
import { Template } from '@/types/template';
import { logger } from '@/utils/logger';

interface BrandingData {
  logo?: string;
  favicon?: string;
  brandName?: string;
  tagline?: string;
  description?: string;
  logoPosition?: 'left' | 'center' | 'right';
}

export const useBranding = (template: Template | null) => {
  const [brandingData, setBrandingData] = useState<BrandingData>({});

  // 🚀 OPTIMISATION: Mémoriser l'extraction du bloc branding
  const brandingBlock = useMemo(() => {
    if (!template) {
      logger.debug('useBranding: Pas de template', undefined, 'useBranding');
      return null;
    }

    logger.debug('useBranding: Recherche bloc branding dans template', { templateId: template?.id || 'unknown' }, 'useBranding');

    // Chercher le bloc branding dans toutes les pages du template
    let foundBlock = null;

    // Chercher dans toutes les pages
    if (template.pages) {
      Object.entries(template.pages).forEach(([pageName, pageBlocks]) => {
        const block = pageBlocks.find(block => block.type === 'branding');
        if (block) {
          logger.debug('Bloc branding trouvé dans la page', { pageName, blockContent: block.content }, 'useBranding');
          foundBlock = block;
        }
      });
    }

    return foundBlock;
  }, [template?.id, template?.pages]);

  // 🚀 OPTIMISATION: Mémoriser les données branding extraites
  const extractedBrandingData = useMemo(() => {
    if (!brandingBlock) {
      logger.warn('Aucun bloc branding trouvé dans le template', { templateId: template?.id || 'unknown' }, 'useBranding');
      return {};
    }

    const newBrandingData = {
      logo: brandingBlock.content.logo || '',
      favicon: brandingBlock.content.favicon || '',
      brandName: brandingBlock.content.brandName || '',
      tagline: brandingBlock.content.tagline || '',
      description: brandingBlock.content.description || '',
      logoPosition: brandingBlock.content.logoPosition || 'left'
    };

    logger.debug('Données branding extraites', { brandingData: newBrandingData }, 'useBranding');
    return newBrandingData;
  }, [brandingBlock]);

  useEffect(() => {
    setBrandingData(extractedBrandingData);
  }, [extractedBrandingData]);

  return brandingData;
};
