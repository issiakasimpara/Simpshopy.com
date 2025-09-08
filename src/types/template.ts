export interface TemplateBlock {
  id: string;
  type: 'hero' | 'products' | 'product-detail' | 'text-image' | 'text-video' | 'video' | 'testimonials' | 'newsletter' | 'contact' | 'gallery' | 'features' | 'team' | 'faq' | 'before-after' | 'footer' | 'cart' | 'checkout' | 'comparison' | 'guarantees' | 'announcement' | 'branding';
  content: any;
  styles: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
  };
  order: number;
}

export interface PageMetadata {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean; // true pour home, product, etc.
  isVisible: boolean; // visible dans la navigation
  order: number; // ordre d'affichage
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  blocks: TemplateBlock[];
  styles: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  pages: {
    [key: string]: TemplateBlock[];
  };
  pageMetadata?: {
    [key: string]: PageMetadata;
  };
}

export interface SiteBuilder {
  id: string;
  storeId: string;
  templateId: string;
  customBlocks: TemplateBlock[];
  customStyles: any;
  pages: {
    [key: string]: TemplateBlock[];
  };
  isPublished: boolean;
  domain?: string;
}

export type TemplateCategory = 
  | 'fashion'
  | 'electronics'
  | 'food'
  | 'beauty'
  | 'sports'
  | 'home'
  | 'art';


