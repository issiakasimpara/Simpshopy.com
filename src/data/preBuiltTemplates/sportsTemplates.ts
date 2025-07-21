
import { Template } from '@/types/template';

export const sportsTemplates: Template[] = [
  {
    id: 'sports-active',
    name: 'Active Sports',
    category: 'sports',
    description: 'Template dynamique pour équipements sportifs',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
    styles: {
      primaryColor: '#007bff',
      secondaryColor: '#ffffff',
      fontFamily: 'Roboto',
    },
    blocks: [],
    pages: {
      home: [
        {
          id: 'hero-sports-1',
          type: 'hero',
          content: {
            title: 'Dépassez Vos Limites',
            subtitle: 'Équipements sportifs de haute performance',
            buttonText: 'Shop Now',
            mediaType: 'video',
            mediaUrl: 'https://player.vimeo.com/video/123456789',
            backgroundImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
          },
          styles: {
            backgroundColor: '#007bff',
            textColor: '#ffffff',
            padding: '120px 0',
          },
          order: 1
        },
        {
          id: 'features-sports-1',
          type: 'features',
          content: {
            title: 'Performance & Innovation',
            layout: 'grid',
            showIcons: true
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            padding: '80px 0',
          },
          order: 2
        },
        {
          id: 'products-sports-1',
          type: 'products',
          content: {
            title: 'Équipements Pro',
            layout: 'grid',
            productsToShow: 8,
            showPrice: true,
            showSpecs: true
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
          id: 'product-sports-1',
          type: 'text-image',
          content: {
            layout: 'image-left',
            showSpecs: true,
            showSizes: true,
            showTechnology: true
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
          id: 'category-sports-1',
          type: 'hero',
          content: {
            showFilters: true,
            showSports: true,
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
          id: 'contact-sports-1',
          type: 'contact',
          content: {
            title: 'Support Technique',
            showSupport: true,
            showWarranty: true
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
