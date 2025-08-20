import { supabase } from '@/integrations/supabase/client';
import { siteTemplateService } from '@/services/siteTemplateService';
import { preBuiltTemplates } from '@/data/preBuiltTemplates';

/**
 * Script de diagnostic pour tester la sauvegarde de templates
 */
export const debugSaveTemplate = async () => {
  console.log('🔍 === DIAGNOSTIC SAUVEGARDE TEMPLATE ===');
  
  try {
    // 1. Vérifier l'authentification
    console.log('\n1. 🔐 Vérification authentification...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Pas d\'utilisateur connecté:', authError);
      return { success: false, error: 'Pas d\'utilisateur connecté' };
    }
    
    console.log('✅ Utilisateur connecté:', user.email);

    // 2. Vérifier le profil
    console.log('\n2. 👤 Vérification profil...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Erreur profil:', profileError);
      return { success: false, error: 'Profil non trouvé' };
    }

    console.log('✅ Profil trouvé:', profile.id);

    // 3. Vérifier les stores
    console.log('\n3. 🏪 Vérification stores...');
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .eq('merchant_id', profile.id);

    if (storesError) {
      console.error('❌ Erreur stores:', storesError);
      return { success: false, error: 'Erreur récupération stores' };
    }

    if (!stores || stores.length === 0) {
      console.error('❌ Aucun store trouvé');
      return { success: false, error: 'Aucun store trouvé' };
    }

    const store = stores[0];
    console.log('✅ Store trouvé:', store.id, store.name);

    // 4. Tester la sauvegarde d'un template
    console.log('\n4. 💾 Test sauvegarde template...');
    const testTemplate = preBuiltTemplates[0]; // Premier template
    
    console.log('Template à sauvegarder:', {
      id: testTemplate.id,
      name: testTemplate.name,
      storeId: store.id
    });

    // Test direct avec siteTemplateService
    try {
      const savedId = await siteTemplateService.saveTemplate(
        store.id,
        testTemplate.id,
        testTemplate,
        false // Pas publié pour le test
      );
      
      console.log('✅ Template sauvegardé avec ID:', savedId);

      // 5. Vérifier que le template est bien sauvegardé
      console.log('\n5. ✅ Vérification sauvegarde...');
      const { data: savedTemplate, error: loadError } = await supabase
        .from('site_templates')
        .select('*')
        .eq('id', savedId)
        .single();

      if (loadError) {
        console.error('❌ Erreur vérification:', loadError);
        return { success: false, error: 'Template non trouvé après sauvegarde' };
      }

      console.log('✅ Template vérifié:', {
        id: savedTemplate.id,
        store_id: savedTemplate.store_id,
        template_id: savedTemplate.template_id,
        is_published: savedTemplate.is_published
      });

      // 6. Test de publication
      console.log('\n6. 📤 Test publication...');
      const publishedId = await siteTemplateService.saveTemplate(
        store.id,
        testTemplate.id,
        testTemplate,
        true // Publié
      );

      console.log('✅ Template publié avec ID:', publishedId);

      // 7. Vérifier la publication
      const { data: publishedTemplate, error: publishError } = await supabase
        .from('site_templates')
        .select('*')
        .eq('id', publishedId)
        .single();

      if (publishError) {
        console.error('❌ Erreur vérification publication:', publishError);
        return { success: false, error: 'Template non trouvé après publication' };
      }

      console.log('✅ Publication vérifiée:', {
        id: publishedTemplate.id,
        is_published: publishedTemplate.is_published
      });

      return {
        success: true,
        data: {
          user: user.email,
          profile: profile.id,
          store: { id: store.id, name: store.name },
          savedTemplate: savedTemplate.id,
          publishedTemplate: publishedTemplate.id
        }
      };

    } catch (saveError) {
      console.error('❌ Erreur sauvegarde:', saveError);
      return { success: false, error: saveError.message };
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test spécifique pour vérifier les permissions de la table site_templates
 */
export const debugTablePermissions = async () => {
  console.log('🔍 === TEST PERMISSIONS TABLE ===');
  
  try {
    // Test SELECT
    console.log('\n1. 📖 Test SELECT...');
    const { data: selectData, error: selectError } = await supabase
      .from('site_templates')
      .select('id')
      .limit(1);

    if (selectError) {
      console.error('❌ Erreur SELECT:', selectError);
    } else {
      console.log('✅ SELECT OK, nombre de templates:', selectData?.length || 0);
    }

    // Test INSERT
    console.log('\n2. ➕ Test INSERT...');
    const testData = {
      store_id: 'test-store-id',
      template_id: 'test-template-id',
      template_data: { id: 'test', name: 'Test Template', pages: [] },
      is_published: false
    };

    const { data: insertData, error: insertError } = await supabase
      .from('site_templates')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur INSERT:', insertError);
    } else {
      console.log('✅ INSERT OK, ID:', insertData?.id);
      
      // Nettoyer le test
      await supabase
        .from('site_templates')
        .delete()
        .eq('id', insertData.id);
      console.log('🧹 Test data nettoyé');
    }

    return { success: !selectError && !insertError };

  } catch (error) {
    console.error('❌ Erreur permissions:', error);
    return { success: false, error: error.message };
  }
};
