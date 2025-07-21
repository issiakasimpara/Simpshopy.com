import { supabase } from '@/integrations/supabase/client';

export const debugStorefront = async (storeSlug: string) => {
  console.log('🔍 DEBUG STOREFRONT - Début du diagnostic');
  console.log('=====================================');
  console.log('Store slug recherché:', storeSlug);

  try {
    // 1. Vérifier toutes les boutiques
    console.log('\n1. 📋 Vérification de toutes les boutiques...');
    const { data: allStores, error: storesError } = await supabase
      .from('stores')
      .select('id, name, status')
      .eq('status', 'active');

    if (storesError) {
      console.error('❌ Erreur lors de la récupération des boutiques:', storesError);
      return;
    }

    console.log('✅ Boutiques trouvées:', allStores?.length || 0);
    allStores?.forEach(store => {
      const generatedSlug = store.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      console.log(`- "${store.name}" → slug: "${generatedSlug}" (${store.status})`);
    });

    // 2. Trouver la boutique correspondante
    console.log('\n2. 🎯 Recherche de la boutique correspondante...');
    const foundStore = allStores?.find(s => {
      const generatedSlug = s.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return generatedSlug === storeSlug;
    });

    if (!foundStore) {
      console.error('❌ Aucune boutique trouvée pour le slug:', storeSlug);
      console.log('💡 Slugs disponibles:', allStores?.map(s => 
        s.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      ));
      return;
    }

    console.log('✅ Boutique trouvée:', foundStore.name, '(ID:', foundStore.id, ')');

    // 3. Vérifier les templates
    console.log('\n3. 📄 Vérification des templates...');
    const { data: allTemplates, error: templatesError } = await supabase
      .from('site_templates')
      .select('id, template_id, is_published, created_at, updated_at')
      .eq('store_id', foundStore.id)
      .order('updated_at', { ascending: false });

    if (templatesError) {
      console.error('❌ Erreur lors de la récupération des templates:', templatesError);
      return;
    }

    console.log('📋 Templates trouvés:', allTemplates?.length || 0);
    allTemplates?.forEach(template => {
      console.log(`- Template ID: ${template.template_id}`);
      console.log(`  Publié: ${template.is_published ? '✅ OUI' : '❌ NON'}`);
      console.log(`  Créé: ${new Date(template.created_at).toLocaleString()}`);
      console.log(`  Modifié: ${new Date(template.updated_at).toLocaleString()}`);
      console.log('---');
    });

    // 4. Vérifier les templates publiés
    const publishedTemplates = allTemplates?.filter(t => t.is_published);
    console.log('\n4. ✅ Templates publiés:', publishedTemplates?.length || 0);

    if (publishedTemplates && publishedTemplates.length > 0) {
      console.log('🎉 La boutique DEVRAIT être accessible !');
      console.log('URL recommandée:', `http://localhost:4000/store/${storeSlug}`);
    } else {
      console.log('⚠️ Aucun template publié - boutique non accessible');
      console.log('💡 Solution: Allez dans le site builder et cliquez sur "Publier"');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }

  console.log('\n🔍 DEBUG STOREFRONT - Fin du diagnostic');
  console.log('=====================================');
};

// Fonction à appeler depuis la console
(window as any).debugStorefront = debugStorefront;
