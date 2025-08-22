import { supabase } from '@/integrations/supabase/client';

export const addTestShippingData = async () => {
  try {
    console.log('🚀 Ajout des données de test pour la livraison...');

    // 1. Récupérer la première boutique
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('id, name')
      .limit(1);

    if (storeError || !stores || stores.length === 0) {
      throw new Error('Aucune boutique trouvée');
    }

    const store = stores[0];
    console.log('🏪 Boutique trouvée:', store.name);

    // 2. Supprimer les anciennes données pour éviter les doublons
    await supabase.from('shipping_methods').delete().eq('store_id', store.id);
    await supabase.from('shipping_zones').delete().eq('store_id', store.id);

    // 3. Créer des zones de livraison avec noms français exacts
    const zones = [
      {
        store_id: store.id,
        name: 'Afrique de l\'Ouest',
        countries: ['Mali', 'Burkina Faso', 'Sénégal', 'Côte d\'Ivoire', 'Niger', 'Guinée', 'Bénin', 'Togo']
      },
      {
        store_id: store.id,
        name: 'Afrique Centrale',
        countries: ['Cameroun', 'Tchad', 'République centrafricaine', 'Gabon', 'République du Congo', 'République démocratique du Congo']
      },
      {
        store_id: store.id,
        name: 'Océan Indien',
        countries: ['Madagascar', 'Comores']
      }
    ];

    const { data: createdZones, error: zoneError } = await supabase
      .from('shipping_zones')
      .insert(zones)
      .select();

    if (zoneError) throw zoneError;
    console.log('🌍 Zones créées:', createdZones);

    // 4. Créer des méthodes de livraison
    const methods = [
      // Pour l'Afrique de l'Ouest
      {
        store_id: store.id,
        shipping_zone_id: createdZones[0].id,
        name: 'Livraison Standard Ouest',
        description: 'Livraison standard en Afrique de l\'Ouest (3-5 jours)',
        price: 2500,
        estimated_days: '3-5 jours ouvrables',
        is_active: true,
        sort_order: 1
      },
      {
        store_id: store.id,
        shipping_zone_id: createdZones[0].id,
        name: 'Livraison Express Ouest',
        description: 'Livraison rapide en Afrique de l\'Ouest (24-48h)',
        price: 5000,
        estimated_days: '1-2 jours ouvrables',
        is_active: true,
        sort_order: 2
      },
      {
        store_id: store.id,
        shipping_zone_id: createdZones[0].id,
        name: 'Livraison Gratuite Ouest',
        description: 'Livraison gratuite en Afrique de l\'Ouest (commandes +50k CFA)',
        price: 0,
        estimated_days: '5-7 jours ouvrables',
        is_active: true,
        sort_order: 3
      },
      // Pour l'Afrique Centrale
      {
        store_id: store.id,
        shipping_zone_id: createdZones[1].id,
        name: 'Livraison Standard Centrale',
        description: 'Livraison standard en Afrique Centrale',
        price: 3500,
        estimated_days: '5-7 jours ouvrables',
        is_active: true,
        sort_order: 1
      },
      {
        store_id: store.id,
        shipping_zone_id: createdZones[1].id,
        name: 'Livraison Express Centrale',
        description: 'Livraison rapide en Afrique Centrale',
        price: 6000,
        estimated_days: '2-3 jours ouvrables',
        is_active: true,
        sort_order: 2
      },
      // Pour l'Océan Indien
      {
        store_id: store.id,
        shipping_zone_id: createdZones[2].id,
        name: 'Livraison Océan Indien',
        description: 'Livraison vers Madagascar et Comores',
        price: 4000,
        estimated_days: '7-10 jours ouvrables',
        is_active: true,
        sort_order: 1
      },
      // Retrait en magasin (sans zone spécifique - disponible partout)
      {
        store_id: store.id,
        shipping_zone_id: null,
        name: 'Retrait en magasin',
        description: 'Récupérez votre commande directement en magasin',
        price: 0,
        estimated_days: 'Immédiat',
        is_active: true,
        sort_order: 0
      }
    ];

    const { data: createdMethods, error: methodError } = await supabase
      .from('shipping_methods')
      .insert(methods)
      .select();

    if (methodError) throw methodError;
    console.log('📦 Méthodes créées:', createdMethods);

    console.log('✅ Données de test ajoutées avec succès !');
    return { zones: createdZones, methods: createdMethods };

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données de test:', error);
    throw error;
  }
};
