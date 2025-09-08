
import { Template } from '@/types/template';
import { fashionHomeBlocks } from './fashion/fashionHomeBlocks';
import { fashionProductBlocks } from './fashion/fashionProductBlocks';
import { fashionProductDetailBlocks } from './fashion/fashionProductDetailBlocks';
import { fashionCategoryBlocks } from './fashion/fashionCategoryBlocks';
import { fashionContactBlocks } from './fashion/fashionContactBlocks';
import { fashionCartBlocks } from './fashion/fashionCartBlocks';
import { fashionCheckoutBlocks } from './fashion/fashionCheckoutBlocks';
import { createFooterBlock } from './shared/commonFooterBlocks';

const fashionFooterBlock = createFooterBlock('fashion');

export const fashionTemplates: Template[] = [
  {
    id: 'fashion-modern',
    name: 'Fashion Moderne',
    category: 'fashion',
    description: 'Template moderne pour boutique de mode avec galerie produits et design épuré',
    thumbnail: '/placeholder.svg',
    blocks: [...fashionHomeBlocks, fashionFooterBlock],
    styles: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      fontFamily: 'Inter'
    },
    pages: {
      home: [...fashionHomeBlocks, fashionFooterBlock],
      product: [...fashionProductBlocks, fashionFooterBlock],
      'product-detail': [...fashionProductDetailBlocks, fashionFooterBlock],
      category: [...fashionCategoryBlocks, fashionFooterBlock],
      contact: [...fashionContactBlocks, fashionFooterBlock],
      cart: [...fashionCartBlocks, fashionFooterBlock],
      checkout: [...fashionCheckoutBlocks, fashionFooterBlock]
    },
    pageMetadata: {
      home: {
        id: 'home',
        name: 'Accueil',
        slug: 'home',
        description: 'Page d\'accueil principale',
        isSystem: true,
        isVisible: true,
        order: 1
      },
      product: {
        id: 'product',
        name: 'Produits',
        slug: 'product',
        description: 'Catalogue des produits',
        isSystem: true,
        isVisible: true,
        order: 2
      },
      'product-detail': {
        id: 'product-detail',
        name: 'Détail produit',
        slug: 'product-detail',
        description: 'Page de détail d\'un produit',
        isSystem: true,
        isVisible: false,
        order: 3
      },
      category: {
        id: 'category',
        name: 'Catégories',
        slug: 'category',
        description: 'Pages de catégories',
        isSystem: true,
        isVisible: true,
        order: 4
      },
      contact: {
        id: 'contact',
        name: 'Contact',
        slug: 'contact',
        description: 'Informations de contact',
        isSystem: true,
        isVisible: true,
        order: 5
      },
      cart: {
        id: 'cart',
        name: 'Panier',
        slug: 'cart',
        description: 'Panier d\'achat',
        isSystem: true,
        isVisible: false,
        order: 6
      },
      checkout: {
        id: 'checkout',
        name: 'Checkout',
        slug: 'checkout',
        description: 'Page de commande',
        isSystem: true,
        isVisible: false,
        order: 7
      }
    }
  },
  {
    id: 'fashion-luxury',
    name: 'Fashion Luxueux',
    category: 'fashion',
    description: 'Template élégant pour marques de luxe avec animations sophistiquées',
    thumbnail: '/placeholder.svg',
    blocks: [...fashionHomeBlocks, fashionFooterBlock],
    styles: {
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280',
      fontFamily: 'Playfair Display'
    },
    pages: {
      home: [...fashionHomeBlocks, fashionFooterBlock],
      product: [...fashionProductBlocks, fashionFooterBlock],
      'product-detail': [...fashionProductDetailBlocks, fashionFooterBlock],
      category: [...fashionCategoryBlocks, fashionFooterBlock],
      contact: [...fashionContactBlocks, fashionFooterBlock],
      cart: [...fashionCartBlocks, fashionFooterBlock],
      checkout: [...fashionCheckoutBlocks, fashionFooterBlock]
    }
  },
  {
    id: 'fashion-minimalist',
    name: 'Fashion Minimaliste',
    category: 'fashion',
    description: 'Design épuré et minimaliste pour une expérience shopping raffinée',
    thumbnail: '/placeholder.svg',
    blocks: [...fashionHomeBlocks, fashionFooterBlock],
    styles: {
      primaryColor: '#059669',
      secondaryColor: '#6b7280',
      fontFamily: 'Source Sans Pro'
    },
    pages: {
      home: [...fashionHomeBlocks, fashionFooterBlock],
      product: [...fashionProductBlocks, fashionFooterBlock],
      'product-detail': [...fashionProductDetailBlocks, fashionFooterBlock],
      category: [...fashionCategoryBlocks, fashionFooterBlock],
      contact: [...fashionContactBlocks, fashionFooterBlock],
      cart: [...fashionCartBlocks, fashionFooterBlock],
      checkout: [...fashionCheckoutBlocks, fashionFooterBlock]
    }
  }
];
