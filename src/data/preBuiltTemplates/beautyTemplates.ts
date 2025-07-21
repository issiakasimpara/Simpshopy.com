
import { Template } from '@/types/template';
import { fashionHomeBlocks } from './fashion/fashionHomeBlocks';
import { fashionProductBlocks } from './fashion/fashionProductBlocks';
import { fashionProductDetailBlocks } from './fashion/fashionProductDetailBlocks';
import { fashionCategoryBlocks } from './fashion/fashionCategoryBlocks';
import { fashionContactBlocks } from './fashion/fashionContactBlocks';
import { fashionCartBlocks } from './fashion/fashionCartBlocks';
import { fashionCheckoutBlocks } from './fashion/fashionCheckoutBlocks';
import { createFooterBlock } from './shared/commonFooterBlocks';

const beautyFooterBlock = createFooterBlock('beauty');

export const beautyTemplates: Template[] = [
  {
    id: 'beauty-elegant',
    name: 'Beauté Élégante',
    category: 'beauty',
    description: 'Template raffiné pour cosmétiques avec couleurs douces et design féminin',
    thumbnail: '/placeholder.svg',
    blocks: [...fashionHomeBlocks, beautyFooterBlock],
    styles: {
      primaryColor: '#ec4899',
      secondaryColor: '#9ca3af',
      fontFamily: 'Playfair Display'
    },
    pages: {
      home: [...fashionHomeBlocks, beautyFooterBlock],
      product: [...fashionProductBlocks, beautyFooterBlock],
      'product-detail': [...fashionProductDetailBlocks, beautyFooterBlock],
      category: [...fashionCategoryBlocks, beautyFooterBlock],
      contact: [...fashionContactBlocks, beautyFooterBlock],
      cart: [...fashionCartBlocks, beautyFooterBlock],
      checkout: [...fashionCheckoutBlocks, beautyFooterBlock]
    }
  },
  {
    id: 'beauty-natural',
    name: 'Beauté Naturelle',
    category: 'beauty',
    description: 'Design organique pour produits naturels avec tons verts et earthy',
    thumbnail: '/placeholder.svg',
    blocks: [...fashionHomeBlocks, beautyFooterBlock],
    styles: {
      primaryColor: '#059669',
      secondaryColor: '#6b7280',
      fontFamily: 'Inter'
    },
    pages: {
      home: [...fashionHomeBlocks, beautyFooterBlock],
      product: [...fashionProductBlocks, beautyFooterBlock],
      'product-detail': [...fashionProductDetailBlocks, beautyFooterBlock],
      category: [...fashionCategoryBlocks, beautyFooterBlock],
      contact: [...fashionContactBlocks, beautyFooterBlock],
      cart: [...fashionCartBlocks, beautyFooterBlock],
      checkout: [...fashionCheckoutBlocks, beautyFooterBlock]
    }
  }
];
