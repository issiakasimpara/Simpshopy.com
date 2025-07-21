
import { Template } from '@/types/template';

export const artTemplates: Template[] = [
  {
    id: 'art-gallery',
    name: 'Art Gallery',
    category: 'art',
    description: 'Template artistique pour œuvres d\'art et créations',
    thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262',
    styles: {
      primaryColor: '#4a4a4a',
      secondaryColor: '#ffffff',
      fontFamily: 'Crimson Text',
    },
    blocks: [],
    pages: {
      home: [
        {
          id: 'hero-art-1',
          type: 'hero',
          content: {
            title: 'Art & Créativité',
            subtitle: 'Œuvres uniques et créations artisanales',
            buttonText: 'Explorer',
            mediaType: 'image',
            backgroundImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262'
          },
          styles: {
            backgroundColor: '#4a4a4a',
            textColor: '#ffffff',
            padding: '120px 0',
          },
          order: 1
        },
        {
          id: 'gallery-art-1',
          type: 'gallery',
          content: {
            title: 'Notre Galerie',
            layout: 'masonry',
            showOverlay: true,
            showArtist: true
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            padding: '80px 0',
          },
          order: 2
        },
        {
          id: 'testimonials-art-1',
          type: 'testimonials',
          content: {
            title: 'Avis des Collectionneurs',
            layout: 'grid',
            showImages: true
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
          id: 'product-art-1',
          type: 'text-image',
          content: {
            layout: 'image-left',
            showArtist: true,
            showTechnique: true,
            showDimensions: true
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
          id: 'category-art-1',
          type: 'hero',
          content: {
            showFilters: true,
            showStyles: true,
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
          id: 'contact-art-1',
          type: 'contact',
          content: {
            title: 'Commission d\'Œuvre',
            showCommission: true,
            showExhibition: true
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
