import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Test du système de sous-domaines
 * Utilisez cette fonction pour vérifier que tout fonctionne
 */
export async function testSubdomainSystem() {
  logger.info('Test du système de sous-domaines', undefined, 'testSubdomainSystem');

  try {
    // 1. Récupérer toutes les boutiques actives
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name, slug, status')
      .eq('status', 'active');

    if (storesError) {
      console.error('❌ Erreur récupération boutiques:', storesError);
      return false;
    }

    logger.info('Boutiques actives trouvées', { count: stores?.length || 0 }, 'testSubdomainSystem');

    // 2. Vérifier les sous-domaines pour chaque boutique
    for (const store of stores || []) {
      logger.info('Test de la boutique', { name: store.name, slug: store.slug }, 'testSubdomainSystem');

      // Vérifier si le sous-domaine existe
      const { data: domain, error: domainError } = await supabase
        .from('store_domains')
        .select('*')
        .eq('store_id', store.id)
        .eq('domain_type', 'subdomain')
        .single();

      if (domainError || !domain) {
        logger.warn('Sous-domaine manquant', { storeName: store.name }, 'testSubdomainSystem');
        
        // Créer le sous-domaine manquant
        const { error: createError } = await supabase
          .from('store_domains')
          .insert({
            store_id: store.id,
            domain_type: 'subdomain',
            domain_name: `${store.slug}.simpshopy.com`,
            is_primary: true,
            is_active: true,
            verification_status: 'verified'
          });

        if (createError) {
          console.error(`❌ Erreur création sous-domaine:`, createError);
        } else {
          logger.info('Sous-domaine créé', { domain: `${store.slug}.simpshopy.com` }, 'testSubdomainSystem');
        }
      } else {
        logger.info('Sous-domaine existant', { domain: domain.domain_name }, 'testSubdomainSystem');
      }

      // 3. Tester l'Edge Function
      const testHostname = `${store.slug}.simpshopy.com`;
      logger.info('Test Edge Function', { hostname: testHostname }, 'testSubdomainSystem');

      const { data: routerData, error: routerError } = await supabase.functions.invoke('domain-router', {
        body: { hostname: testHostname },
      });

      if (routerError) {
        console.error(`❌ Erreur Edge Function:`, routerError);
      } else if (routerData?.success && routerData?.store) {
        logger.info('Edge Function OK', { storeName: routerData.store.name }, 'testSubdomainSystem');
      } else {
        logger.error('Edge Function échoué', { hostname: testHostname }, 'testSubdomainSystem');
      }
    }

    // 4. Test de la fonction get_store_by_domain
    logger.info('Test de la fonction get_store_by_domain', undefined, 'testSubdomainSystem');
    
    if (stores && stores.length > 0) {
      const testStore = stores[0];
      const testDomain = `${testStore.slug}.simpshopy.com`;
      
      const { data: storeId, error: functionError } = await supabase.rpc('get_store_by_domain', {
        p_domain: testDomain
      });

      if (functionError) {
        console.error('❌ Erreur fonction get_store_by_domain:', functionError);
      } else if (storeId === testStore.id) {
        logger.info('Fonction get_store_by_domain OK', { storeId }, 'testSubdomainSystem');
      } else {
        logger.error('Fonction get_store_by_domain échoué', { expected: testStore.id, received: storeId }, 'testSubdomainSystem');
      }
    }

    logger.info('Test du système de sous-domaines terminé', undefined, 'testSubdomainSystem');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
}

/**
 * Générer un rapport des sous-domaines
 */
export async function generateSubdomainReport() {
  logger.info('Rapport des sous-domaines', undefined, 'testSubdomainSystem');

  try {
    const { data: domains, error } = await supabase
      .from('store_domains')
      .select(`
        id,
        domain_name,
        domain_type,
        is_active,
        verification_status,
        stores (
          id,
          name,
          slug,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération domaines:', error);
      return;
    }

    logger.info('Total domaines', { count: domains?.length || 0 }, 'testSubdomainSystem');
    
    const subdomains = domains?.filter(d => d.domain_type === 'subdomain') || [];
    const customDomains = domains?.filter(d => d.domain_type === 'custom') || [];
    
    logger.info('Sous-domaines', { count: subdomains.length }, 'testSubdomainSystem');
    logger.info('Domaines personnalisés', { count: customDomains.length }, 'testSubdomainSystem');

    logger.info('Liste des sous-domaines', undefined, 'testSubdomainSystem');
    subdomains.forEach(domain => {
      const status = domain.is_active && domain.verification_status === 'verified' ? '✅' : '❌';
      logger.info('Sous-domaine', { domain: domain.domain_name, store: domain.stores?.name || 'Boutique inconnue', status }, 'testSubdomainSystem');
    });

    if (customDomains.length > 0) {
      logger.info('Liste des domaines personnalisés', undefined, 'testSubdomainSystem');
      customDomains.forEach(domain => {
        const status = domain.is_active && domain.verification_status === 'verified' ? '✅' : '❌';
        logger.info('Sous-domaine', { domain: domain.domain_name, store: domain.stores?.name || 'Boutique inconnue', status }, 'testSubdomainSystem');
      });
    }

  } catch (error) {
    console.error('❌ Erreur génération rapport:', error);
  }
}

/**
 * Nettoyer les domaines orphelins
 */
export async function cleanupOrphanedDomains() {
  logger.info('Nettoyage des domaines orphelins', undefined, 'testSubdomainSystem');

  try {
    const { data, error } = await supabase.rpc('cleanup_orphaned_domains');
    
    if (error) {
      console.error('❌ Erreur nettoyage:', error);
      return false;
    }

    logger.info('Domaines orphelins supprimés', { count: data || 0 }, 'testSubdomainSystem');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return false;
  }
}
