import { useState, useEffect, useMemo } from 'react';
import { Template } from '@/types/template';

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
      console.log('🔍 useBranding: Pas de template');
      return null;
    }

    console.log('🔍 useBranding: Recherche bloc branding dans template:', template.id);

    // Chercher le bloc branding dans toutes les pages du template
    let foundBlock = null;

    // Chercher dans toutes les pages
    Object.entries(template.pages).forEach(([pageName, pageBlocks]) => {
      const block = pageBlocks.find(block => block.type === 'branding');
      if (block) {
        console.log(`✅ Bloc branding trouvé dans la page: ${pageName}`, block.content);
        foundBlock = block;
      }
    });

    return foundBlock;
  }, [template?.id, template?.pages]);

  // 🚀 OPTIMISATION: Mémoriser les données branding extraites
  const extractedBrandingData = useMemo(() => {
    if (!brandingBlock) {
      console.log('⚠️ Aucun bloc branding trouvé dans le template');
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

    console.log('🎨 Données branding extraites:', newBrandingData);
    return newBrandingData;
  }, [brandingBlock]);

  useEffect(() => {
    setBrandingData(extractedBrandingData);
  }, [extractedBrandingData]);

  return brandingData;
};
