-- Script pour créer une boutique de test "Mon Essaie"

-- 1. Créer un profil de test (merchant)
INSERT INTO profiles (id, user_id, first_name, last_name, email, phone)
VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  'Test',
  'Merchant',
  'test@example.com',
  '+33123456789'
) ON CONFLICT DO NOTHING;

-- 2. Créer la boutique "Mon Essaie"
INSERT INTO stores (id, name, description, merchant_id, status, logo_url, settings)
VALUES (
  gen_random_uuid(),
  'Mon Essaie',
  'Boutique de test pour démonstration',
  (SELECT id FROM profiles WHERE email = 'test@example.com' LIMIT 1),
  'active',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200',
  '{"currency": "XAF", "language": "fr"}'
) ON CONFLICT DO NOTHING;

-- 3. Créer quelques produits de test
INSERT INTO products (id, store_id, name, description, price, status, images, category_id)
VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM stores WHERE name = 'Mon Essaie' LIMIT 1),
  'T-shirt Premium',
  'T-shirt en coton bio de haute qualité',
  15000,
  'active',
  '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"]',
  null
),
(
  gen_random_uuid(),
  (SELECT id FROM stores WHERE name = 'Mon Essaie' LIMIT 1),
  'Jean Slim',
  'Jean slim moderne et confortable',
  25000,
  'active',
  '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"]',
  null
),
(
  gen_random_uuid(),
  (SELECT id FROM stores WHERE name = 'Mon Essaie' LIMIT 1),
  'Sneakers Sport',
  'Chaussures de sport tendance',
  35000,
  'active',
  '["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"]',
  null
) ON CONFLICT DO NOTHING;

-- 4. Créer un template publié pour la boutique
INSERT INTO site_templates (id, store_id, template_id, template_data, is_published)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM stores WHERE name = 'Mon Essaie' LIMIT 1),
  'fashion-modern',
  '{
    "id": "fashion-modern",
    "name": "Fashion Moderne",
    "category": "fashion",
    "description": "Template moderne pour boutique de mode",
    "thumbnail": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    "styles": {
      "primaryColor": "#000000",
      "secondaryColor": "#ffffff",
      "fontFamily": "Inter"
    },
    "pages": {
      "home": [
        {
          "id": "hero-1",
          "type": "hero",
          "content": {
            "title": "Bienvenue chez Mon Essaie",
            "subtitle": "Découvrez notre collection unique",
            "buttonText": "Voir la boutique",
            "buttonLink": "/products",
            "mediaType": "image",
            "backgroundImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"
          },
          "styles": {
            "backgroundColor": "#000000",
            "textColor": "#ffffff",
            "padding": "120px 0"
          },
          "order": 1
        },
        {
          "id": "products-1",
          "type": "products",
          "content": {
            "title": "Nos Produits",
            "productsToShow": 6,
            "layout": "grid",
            "showPrice": true,
            "showAddToCart": true
          },
          "styles": {
            "backgroundColor": "#ffffff",
            "textColor": "#000000",
            "padding": "80px 0"
          },
          "order": 2
        }
      ],
      "product": [
        {
          "id": "products-listing",
          "type": "products",
          "content": {
            "title": "Tous nos produits",
            "layout": "grid",
            "productsToShow": 12,
            "showPrice": true,
            "showAddToCart": true,
            "showFilters": true
          },
          "styles": {
            "backgroundColor": "#ffffff",
            "textColor": "#000000",
            "padding": "60px 0"
          },
          "order": 1
        }
      ],
      "contact": [
        {
          "id": "contact-1",
          "type": "contact",
          "content": {
            "title": "Contactez-nous",
            "showForm": true,
            "phone": "+33123456789",
            "email": "contact@monessaie.com",
            "address": "123 Rue de la Mode, Paris"
          },
          "styles": {
            "backgroundColor": "#ffffff",
            "textColor": "#000000",
            "padding": "80px 0"
          },
          "order": 1
        }
      ]
    }
  }',
  true
) ON CONFLICT DO NOTHING;
