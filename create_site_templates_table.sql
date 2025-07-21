-- Script SQL pour créer la table site_templates
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table site_templates
CREATE TABLE IF NOT EXISTS public.site_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    template_id VARCHAR(255) NOT NULL,
    template_data JSONB NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE(store_id, template_id)
);

-- 2. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_site_templates_store_id ON public.site_templates(store_id);
CREATE INDEX IF NOT EXISTS idx_site_templates_template_id ON public.site_templates(template_id);
CREATE INDEX IF NOT EXISTS idx_site_templates_published ON public.site_templates(is_published);
CREATE INDEX IF NOT EXISTS idx_site_templates_updated_at ON public.site_templates(updated_at);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE public.site_templates ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Les utilisateurs peuvent voir les templates de leurs boutiques
CREATE POLICY "Users can view templates of their stores" ON public.site_templates
    FOR SELECT USING (
        store_id IN (
            SELECT s.id FROM public.stores s
            JOIN public.profiles p ON s.merchant_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Les utilisateurs peuvent créer des templates pour leurs boutiques
CREATE POLICY "Users can create templates for their stores" ON public.site_templates
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT s.id FROM public.stores s
            JOIN public.profiles p ON s.merchant_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Les utilisateurs peuvent modifier les templates de leurs boutiques
CREATE POLICY "Users can update templates of their stores" ON public.site_templates
    FOR UPDATE USING (
        store_id IN (
            SELECT s.id FROM public.stores s
            JOIN public.profiles p ON s.merchant_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Les utilisateurs peuvent supprimer les templates de leurs boutiques
CREATE POLICY "Users can delete templates of their stores" ON public.site_templates
    FOR DELETE USING (
        store_id IN (
            SELECT s.id FROM public.stores s
            JOIN public.profiles p ON s.merchant_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- 5. Politique publique pour les templates publiés (pour le storefront)
CREATE POLICY "Public can view published templates" ON public.site_templates
    FOR SELECT USING (is_published = true);

-- 6. Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_site_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_site_templates_updated_at_trigger
    BEFORE UPDATE ON public.site_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_site_templates_updated_at();

-- 8. Vérification que la table a été créée
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'site_templates' 
ORDER BY ordinal_position;
