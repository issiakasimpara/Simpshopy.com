-- ========================================
-- INVESTIGATION : PROBLÈME DE ROUTING DES SLUGS
-- Vérifier si le changement de routing affecte la vue matérialisée
-- ========================================

-- 1. VÉRIFIER LA STRUCTURE DE LA VUE MATÉRIALISÉE
SELECT 
    'Materialized View Definition' as check_type,
    definition
FROM pg_matviews 
WHERE matviewname = 'mv_stores_with_templates';

-- 2. VÉRIFIER LES DONNÉES DANS LA VUE MATÉRIALISÉE
SELECT 
    'Materialized View Data' as check_type,
    COUNT(*) as total_rows
FROM mv_stores_with_templates;

-- 3. VÉRIFIER LES BOUTIQUES AVEC LEURS SLUGS
SELECT 
    'Stores with Slugs' as check_type,
    id,
    name,
    slug,
    status,
    created_at
FROM stores 
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;

-- 4. VÉRIFIER LES TEMPLATES PUBLIÉS
SELECT 
    'Published Templates' as check_type,
    st.id,
    st.store_id,
    st.template_id,
    st.is_published,
    s.name as store_name,
    s.slug as store_slug
FROM site_templates st
JOIN stores s ON st.store_id = s.id
WHERE st.is_published = true
AND s.status = 'active'
ORDER BY st.updated_at DESC
LIMIT 10;

-- 5. VÉRIFIER LA COHÉRENCE ENTRE STORES ET TEMPLATES
SELECT 
    'Store-Template Consistency' as check_type,
    COUNT(DISTINCT s.id) as total_stores,
    COUNT(DISTINCT st.store_id) as stores_with_templates,
    COUNT(DISTINCT CASE WHEN st.is_published = true THEN st.store_id END) as stores_with_published_templates
FROM stores s
LEFT JOIN site_templates st ON s.id = st.store_id
WHERE s.status = 'active';

-- 6. VÉRIFIER LES BOUTIQUES SANS TEMPLATES PUBLIÉS
SELECT 
    'Stores without Published Templates' as check_type,
    s.id,
    s.name,
    s.slug,
    COUNT(st.id) as total_templates,
    COUNT(CASE WHEN st.is_published = true THEN 1 END) as published_templates
FROM stores s
LEFT JOIN site_templates st ON s.id = st.store_id
WHERE s.status = 'active'
GROUP BY s.id, s.name, s.slug
HAVING COUNT(CASE WHEN st.is_published = true THEN 1 END) = 0
ORDER BY s.created_at DESC
LIMIT 10;

-- 7. TESTER LA REQUÊTE DE LA VUE MATÉRIALISÉE MANUELLEMENT
-- (Pour voir si elle fonctionne toujours avec les nouveaux slugs)
SELECT 
    'Manual View Query Test' as check_type,
    s.id,
    s.name,
    s.slug,
    st.template_id,
    st.is_published
FROM stores s
LEFT JOIN site_templates st ON s.id = st.store_id
WHERE s.status = 'active'
AND st.is_published = true
ORDER BY s.created_at DESC
LIMIT 5;

-- 8. VÉRIFIER SI LE PROBLÈME VIENT DE LA VUE MATÉRIALISÉE
-- Tenter de rafraîchir la vue manuellement
REFRESH MATERIALIZED VIEW mv_stores_with_templates;

-- 9. RÉSULTAT DE L'INVESTIGATION
SELECT 
    'INVESTIGATION TERMINÉE' as status,
    'Vérifiez les résultats ci-dessus pour identifier les problèmes de cohérence' as instruction;
