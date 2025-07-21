
import { Template } from '@/types/template';

export const foodTemplates: Template[] = [
  {
    id: 'food-gourmet',
    name: 'Gourmet Kitchen',
    category: 'food',
    description: 'Template savoureux pour restaurant et épicerie fine',
    thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    styles: {
      primaryColor: '#d2691e',
      secondaryColor: '#ffffff',
      fontFamily: 'Merriweather',
    },
    blocks: [],
    pages: {
      home: [
        {
          id: 'hero-food-1',
          type: 'hero',
          content: {
            title: 'Saveurs Authentiques',
            subtitle: 'Cuisine traditionnelle et produits du terroir',
            buttonText: 'Commander',
            mediaType: 'image',
            backgroundImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'
          },
          styles: {
            backgroundColor: '#d2691e',
            textColor: '#ffffff',
            padding: '120px 0',
          },
          order: 1
        },
        {
          id: 'products-food-1',
          type: 'products',
          content: {
            title: 'Notre Menu',
            layout: 'carousel',
            productsToShow: 6,
            showPrice: true,
            showNutrition: true,
            categories: ['Entrées', 'Plats', 'Desserts', 'Vins']
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            padding: '80px 0',
          },
          order: 2
        },
        {
          id: 'gallery-food-1',
          type: 'gallery',
          content: {
            title: 'Notre Cuisine',
            layout: 'masonry',
            showOverlay: true,
            images: [
              {
                url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
                title: 'Pizza Artisanale',
                description: 'Pâte fraîche et ingrédients locaux'
              },
              {
                url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
                title: 'Pancakes Maison',
                description: 'Recette traditionnelle américaine'
              },
              {
                url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
                title: 'Salade Fraîcheur',
                description: 'Légumes de saison et vinaigrette maison'
              }
            ]
          },
          styles: {
            backgroundColor: '#fef7ed',
            textColor: '#000000',
            padding: '80px 0',
          },
          order: 3
        }
      ],
      product: [
        {
          id: 'product-food-1',
          type: 'text-image',
          content: {
            layout: 'image-right',
            showIngredients: true,
            showNutrition: true,
            showAllergies: true
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
          id: 'category-food-1',
          type: 'hero',
          content: {
            showFilters: true,
            showDietaryOptions: true,
            layout: 'list'
          },
          styles: {
            backgroundColor: '#fef7ed',
            textColor: '#000000',
            padding: '40px 0',
          },
          order: 1
        }
      ],
      contact: [
        {
          id: 'contact-food-1',
          type: 'contact',
          content: {
            title: 'Réservations',
            showReservation: true,
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
  },
  {
    id: 'food-bakery',
    name: 'Artisan Boulanger',
    category: 'food',
    description: 'Template chaleureux pour boulangerie et pâtisserie artisanale',
    thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
    styles: {
      primaryColor: '#f59e0b',
      secondaryColor: '#fef3c7',
      fontFamily: 'Georgia',
    },
    blocks: [],
    pages: {
      home: [
        {
          id: 'hero-bakery',
          type: 'hero',
          content: {
            title: 'Boulangerie Artisanale',
            subtitle: 'Le goût authentique du pain traditionnel depuis 1950',
            buttonText: 'Nos Spécialités',
            mediaType: 'image',
            backgroundImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff'
          },
          styles: {
            backgroundColor: '#92400e',
            textColor: '#fef3c7',
            padding: '120px 0',
          },
          order: 1
        },
        {
          id: 'products-bakery',
          type: 'products',
          content: {
            title: 'Nos Créations',
            layout: 'grid',
            productsToShow: 9,
            showPrice: true,
            showFreshness: true,
            categories: ['Pains', 'Viennoiseries', 'Pâtisseries', 'Sandwichs']
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#92400e',
            padding: '80px 0',
          },
          order: 2
        }
      ],
      product: [
        {
          id: 'product-bakery',
          type: 'text-image',
          content: {
            layout: 'image-left',
            showRecipe: true,
            showFreshness: true,
            showTradition: true
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#92400e',
            padding: '60px 0',
          },
          order: 1
        }
      ],
      category: [
        {
          id: 'category-bakery',
          type: 'hero',
          content: {
            showFilters: true,
            showPreparationTime: true,
            layout: 'grid'
          },
          styles: {
            backgroundColor: '#fef3c7',
            textColor: '#92400e',
            padding: '40px 0',
          },
          order: 1
        }
      ],
      contact: [
        {
          id: 'contact-bakery',
          type: 'contact',
          content: {
            title: 'Commandes Spéciales',
            showOrders: true,
            showDelivery: true
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#92400e',
            padding: '80px 0',
          },
          order: 1
        }
      ]
    }
  }
];
