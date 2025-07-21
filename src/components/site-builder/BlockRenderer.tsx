
import React, { Suspense, memo } from 'react';
import { TemplateBlock } from '@/types/template';
import type { Tables } from '@/integrations/supabase/types';

// LAZY LOADING pour des performances ultra-rapides ⚡
const AnnouncementBarBlock = React.lazy(() => import('./blocks/AnnouncementBarBlock'));
const BrandingBlock = React.lazy(() => import('./blocks/BrandingBlock'));
const HeroBlock = React.lazy(() => import('./blocks/HeroBlock'));
const ProductsBlock = React.lazy(() => import('./blocks/ProductsBlock'));
const ProductDetailBlock = React.lazy(() => import('./blocks/ProductDetailBlock'));
const TextImageBlock = React.lazy(() => import('./blocks/TextImageBlock'));
const TextVideoBlock = React.lazy(() => import('./blocks/TextVideoBlock'));
const ContactBlock = React.lazy(() => import('./blocks/ContactBlock'));
const GalleryBlock = React.lazy(() => import('./blocks/GalleryBlock'));
const VideoBlock = React.lazy(() => import('./blocks/VideoBlock'));
const FooterBlock = React.lazy(() => import('./blocks/FooterBlock'));
const FeaturesBlock = React.lazy(() => import('./blocks/FeaturesBlock'));
const TestimonialsBlock = React.lazy(() => import('./blocks/TestimonialsBlock'));
const FAQBlock = React.lazy(() => import('./blocks/FAQBlock'));
const BeforeAfterBlock = React.lazy(() => import('./blocks/BeforeAfterBlock'));
const ComparisonBlock = React.lazy(() => import('./blocks/ComparisonBlock'));
const CartBlock = React.lazy(() => import('./blocks/CartBlock'));
const CheckoutBlock = React.lazy(() => import('./blocks/CheckoutBlock'));
const GuaranteesBlock = React.lazy(() => import('./blocks/GuaranteesBlock'));
const DefaultBlock = React.lazy(() => import('./blocks/DefaultBlock'));

// Composant de chargement sophistiqué
const BlockLoadingFallback = memo(() => (
  <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg h-32 w-full" />
));

type Store = Tables<'stores'>;

interface BlockRendererProps {
  block: TemplateBlock;
  isEditing?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
  onUpdate?: (block: TemplateBlock) => void;
  selectedStore?: Store | null;
  productId?: string | null;
  onProductClick?: (productId: string) => void;
  onNavigate?: (page: string) => void;
  products?: any[]; // Ajouter les produits pour éviter les requêtes doubles
}

const BlockRenderer = memo(({
  block,
  isEditing = false,
  viewMode = 'desktop',
  onUpdate,
  selectedStore,
  productId,
  onProductClick,
  onNavigate,
  products
}: BlockRendererProps) => {
  console.log('BlockRenderer - Rendering block:', block.type, 'with productId:', productId);

  const blockProps = {
    block,
    isEditing,
    viewMode,
    onUpdate,
    selectedStore,
    productId,
    onProductClick,
    onNavigate
  };

  const renderBlock = () => {

  switch (block.type) {
    case 'announcement':
      return <AnnouncementBarBlock {...blockProps} />;
    case 'branding':
      return <BrandingBlock {...blockProps} />;
    case 'hero':
      return <HeroBlock {...blockProps} />;
    case 'products':
      return <ProductsBlock {...blockProps} />;
    case 'product-detail':
      console.log('BlockRenderer - Rendering ProductDetailBlock with productId:', productId);
      return <ProductDetailBlock {...blockProps} products={products} />;
    case 'text-image':
      return <TextImageBlock {...blockProps} />;
    case 'text-video':
      return <TextVideoBlock {...blockProps} />;
    case 'contact':
      return <ContactBlock {...blockProps} />;
    case 'gallery':
      return <GalleryBlock {...blockProps} />;
    case 'video':
      return <VideoBlock {...blockProps} />;
    case 'footer':
      return <FooterBlock {...blockProps} />;
    case 'features':
      return <FeaturesBlock {...blockProps} />;
    case 'testimonials':
      return <TestimonialsBlock {...blockProps} />;
    case 'faq':
      return <FAQBlock {...blockProps} />;
    case 'before-after':
      return <BeforeAfterBlock {...blockProps} />;
    case 'comparison':
      return <ComparisonBlock {...blockProps} />;
    case 'cart':
      return <CartBlock {...blockProps} />;
    case 'checkout':
      return <CheckoutBlock {...blockProps} />;
    case 'guarantees':
      return <GuaranteesBlock {...blockProps} />;
    default:
      return <DefaultBlock {...blockProps} />;
    }
  };

  return (
    <Suspense fallback={<BlockLoadingFallback />}>
      {renderBlock()}
    </Suspense>
  );
});

BlockRenderer.displayName = 'BlockRenderer';

export default BlockRenderer;
