
import { Template } from '@/types/template';
import { fashionHomeBlocks } from './fashion/fashionHomeBlocks';
import { fashionProductBlocks } from './fashion/fashionProductBlocks';
import { fashionProductDetailBlocks } from './fashion/fashionProductDetailBlocks';
import { fashionCategoryBlocks } from './fashion/fashionCategoryBlocks';
import { fashionContactBlocks } from './fashion/fashionContactBlocks';
import { fashionCartBlocks } from './fashion/fashionCartBlocks';
import { fashionCheckoutBlocks } from './fashion/fashionCheckoutBlocks';
import { createFooterBlock } from './shared/commonFooterBlocks';

const electronicsFooterBlock = createFooterBlock('electronics');

export const electronicsTemplates: Template[] = [
  {
    id: 'electronics-modern',
    name: 'Tech Moderne',
    category: 'electronics',
    description: 'Template moderne pour boutique high-tech avec mise en avant des spécifications',
    thumbnail: '/placeholder.svg',
    blocks: [...fashionHomeBlocks, electronicsFooterBlock],
    styles: {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      fontFamily: 'Inter'
    },
    pages: {
      home: [...fashionHomeBlocks, electronicsFooterBlock],
      product: [...fashionProductBlocks, electronicsFooterBlock],
      'product-detail': [...fashionProductDetailBlocks, electronicsFooterBlock],
      category: [...fashionCategoryBlocks, electronicsFooterBlock],
      contact: [...fashionContactBlocks, electronicsFooterBlock],
      cart: [...fashionCartBlocks, electronicsFooterBlock],
      checkout: [...fashionCheckoutBlocks, electronicsFooterBlock]
    }
  },
  {
    id: 'electronics-gaming',
    name: 'Gaming Pro',
    category: 'electronics',
    description: 'Parfait pour les boutiques gaming avec design dynamique et coloré',
    thumbnail: '/placeholder.svg',
    blocks: [...fashionHomeBlocks, electronicsFooterBlock],
    styles: {
      primaryColor: '#7c3aed',
      secondaryColor: '#64748b',
      fontFamily: 'Inter'
    },
    pages: {
      home: [...fashionHomeBlocks, electronicsFooterBlock],
      product: [...fashionProductBlocks, electronicsFooterBlock],
      'product-detail': [...fashionProductDetailBlocks, electronicsFooterBlock],
      category: [...fashionCategoryBlocks, electronicsFooterBlock],
      contact: [...fashionContactBlocks, electronicsFooterBlock],
      cart: [...fashionCartBlocks, electronicsFooterBlock],
      checkout: [...fashionCheckoutBlocks, electronicsFooterBlock]
    }
  }
];
