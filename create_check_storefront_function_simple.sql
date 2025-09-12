-- 🚀 CRÉATION SIMPLIFIÉE DE LA FONCTION check_storefront_last_modified
-- Date: 2025-01-28
-- Objectif: Fonction pour vérifier la dernière modification d'un storefront (sans catégories)

-- Supprimer la fonction si elle existe déjà
DROP FUNCTION IF EXISTS check_storefront_last_modified(TEXT);

-- Créer la fonction de vérification des modifications (version simplifiée)
CREATE OR REPLACE FUNCTION check_storefront_last_modified(store_slug TEXT)
RETURNS TIMESTAMP AS $$
DECLARE
    store_id_val UUID;
    last_modified TIMESTAMP := NULL;
    store_updated TIMESTAMP := NULL;
    template_updated TIMESTAMP := NULL;
    products_updated TIMESTAMP := NULL;
BEGIN
    -- Vérifier si le store_slug est valide
    IF store_slug IS NULL OR store_slug = '' THEN
        RAISE EXCEPTION 'store_slug ne peut pas être null ou vide';
    END IF;

    -- Récupérer l'ID du store
    SELECT id INTO store_id_val 
    FROM stores 
    WHERE slug = store_slug AND status = 'active';
    
    -- Si le store n'existe pas, retourner NULL
    IF store_id_val IS NULL THEN
        RETURN NULL;
    END IF;

    -- Vérifier la dernière modification du store
    SELECT updated_at INTO store_updated
    FROM stores 
    WHERE id = store_id_val;

    -- Vérifier la dernière modification des templates
    SELECT MAX(updated_at) INTO template_updated
    FROM site_templates 
    WHERE store_id = store_id_val;

    -- Vérifier la dernière modification des produits
    SELECT MAX(updated_at) INTO products_updated
    FROM products 
    WHERE store_id = store_id_val;

    -- Retourner la date la plus récente (sans catégories)
    last_modified := GREATEST(
        COALESCE(store_updated, '1900-01-01'::timestamp),
        COALESCE(template_updated, '1900-01-01'::timestamp),
        COALESCE(products_updated, '1900-01-01'::timestamp)
    );

    -- Si aucune date n'est trouvée, retourner la date du store
    IF last_modified = '1900-01-01'::timestamp THEN
        last_modified := store_updated;
    END IF;

    RETURN last_modified;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commenter la fonction
COMMENT ON FUNCTION check_storefront_last_modified(TEXT) IS 
'Retourne la dernière date de modification d''un storefront basée sur les modifications du store, templates et produits';

-- Tester la fonction
DO $$
DECLARE
    test_result TIMESTAMP;
    test_store_slug TEXT := 'test-boutique';
BEGIN
    -- Test avec un store inexistant
    test_result := check_storefront_last_modified('store-inexistant');
    
    IF test_result IS NULL THEN
        RAISE NOTICE '✅ Test 1 réussi: store inexistant retourne NULL';
    ELSE
        RAISE NOTICE '❌ Test 1 échoué: store inexistant devrait retourner NULL';
    END IF;
    
    -- Test avec un slug null
    BEGIN
        test_result := check_storefront_last_modified(NULL);
        RAISE NOTICE '❌ Test 2 échoué: slug null devrait lever une exception';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '✅ Test 2 réussi: slug null lève bien une exception';
    END;
    
    RAISE NOTICE '🎉 Tests de la fonction check_storefront_last_modified terminés';
END $$;

-- Afficher le résultat
SELECT '✅ Fonction check_storefront_last_modified créée avec succès (version simplifiée)' as status;
