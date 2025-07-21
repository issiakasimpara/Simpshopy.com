
import { Template } from '@/types/template';

export const homeTemplates: Template[] = [
  {
    id: 'home-cozy',
    name: 'Cozy Home',
    category: 'home',
    description: 'Template chaleureux pour décoration et mobilier',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
    styles: {
      primaryColor: '#8b4513',
      secondaryColor: '#ffffff',
      fontFamily: 'Georgia',
    },
    blocks: [],
    pages: {
      home: [
        {
          id: 'hero-home-1',
          type: 'hero',
          content: {
            title: 'Votre Maison Idéale',
            subtitle: 'Mobilier et décoration pour un intérieur unique',
            buttonText: 'Découvrir',
            mediaType: 'image',
            backgroundImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7'
          },
          styles: {
            backgroundColor: '#8b4513',
            textColor: '#ffffff',
            padding: '120px 0',
          },
          order: 1
        },
        {
          id: 'gallery-home-1',
          type: 'gallery',
          content: {
            title: 'Inspirations Déco',
            layout: 'grid',
            showOverlay: true
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            padding: '80px 0',
          },
          order: 2
        },
        {
          id: 'products-home-1',
          type: 'products',
          content: {
            title: 'Notre Collection',
            layout: 'carousel',
            productsToShow: 6,
            showPrice: true,
            showMaterials: true
          },
          styles: {
            backgroundColor: '#f8f9fa',
            textColor: '#000000',
            padding: '80px 0',
          },
          order: 3
        }
      ],
      product: [
        {
          id: 'product-home-1',
          type: 'text-image',
          content: {
            layout: 'image-right',
            showMaterials: true,
            showDimensions: true,
            showCare: true
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            padding: '60px 0',
          },
          order: 1
        }
      ],
      category: [
        {
          id: 'category-home-1',
          type: 'hero',
          content: {
            showFilters: true,
            showRooms: true,
            layout: 'grid'
          },
          styles: {
            backgroundColor: '#f8f9fa',
            textColor: '#000000',
            padding: '40px 0',
          },
          order: 1
        }
      ],
      contact: [
        {
          id: 'contact-home-1',
          type: 'contact',
          content: {
            title: 'Design Consultation',
            showConsultation: true,
            showDelivery: true
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            padding: '80px 0',
          },
          order: 1
        }
      ]
    }
  }
];
