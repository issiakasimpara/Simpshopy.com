# 🗄️ Création des tables de livraisons dans Supabase

## 📋 Instructions pour créer les tables manuellement

### 1. Table: `shipping_zones`

**Aller sur Supabase → Table Editor → New table**

**Nom de la table:** `shipping_zones`

**Colonnes à créer:**

| Nom | Type | Contraintes | Valeur par défaut |
|-----|------|-------------|-------------------|
| `id` | uuid | Primary Key | `gen_random_uuid()` |
| `store_id` | uuid | Not Null | - |
| `name` | varchar(255) | Not Null | - |
| `description` | text | Nullable | - |
| `countries` | text[] | Not Null | `'{}'` |
| `is_active` | boolean | Not Null | `true` |
| `created_at` | timestamptz | Not Null | `now()` |
| `updated_at` | timestamptz | Not Null | `now()` |

### 2. Table: `shipping_methods`

**Aller sur Supabase → Table Editor → New table**

**Nom de la table:** `shipping_methods`

**Colonnes à créer:**

| Nom | Type | Contraintes | Valeur par défaut |
|-----|------|-------------|-------------------|
| `id` | uuid | Primary Key | `gen_random_uuid()` |
| `store_id` | uuid | Not Null | - |
| `shipping_zone_id` | uuid | Nullable | - |
| `name` | varchar(255) | Not Null | - |
| `description` | text | Nullable | - |
| `icon` | varchar(50) | Not Null | `'🚚'` |
| `price` | numeric(10,2) | Not Null | `0` |
| `free_shipping_threshold` | numeric(10,2) | Nullable | - |
| `estimated_days` | varchar(50) | Not Null | `'3-5 jours'` |
| `is_active` | boolean | Not Null | `true` |
| `sort_order` | integer | Not Null | `0` |
| `created_at` | timestamptz | Not Null | `now()` |
| `updated_at` | timestamptz | Not Null | `now()` |

### 3. Relations (Foreign Keys)

**Pour `shipping_zones`:**
- `store_id` → `stores.id` (ON DELETE CASCADE)

**Pour `shipping_methods`:**
- `store_id` → `stores.id` (ON DELETE CASCADE)
- `shipping_zone_id` → `shipping_zones.id` (ON DELETE CASCADE)

### 4. Index (optionnel mais recommandé)

**Via SQL Editor:**

```sql
-- Index pour shipping_zones
CREATE INDEX IF NOT EXISTS idx_shipping_zones_store_id ON public.shipping_zones(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON public.shipping_zones(is_active);

-- Index pour shipping_methods
CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_zone_id ON public.shipping_methods(shipping_zone_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_sort ON public.shipping_methods(sort_order);
```

### 5. RLS (Row Level Security) - optionnel

**Via SQL Editor:**

```sql
-- Activer RLS
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- Politiques pour shipping_zones
CREATE POLICY "Users can manage shipping zones for their stores" ON public.shipping_zones
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- Politiques pour shipping_methods
CREATE POLICY "Users can manage shipping methods for their stores" ON public.shipping_methods
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
```

## 🚀 Vérification

Une fois les tables créées, vous pouvez:

1. Aller sur l'onglet **Livraisons** dans l'application
2. Cliquer sur **Initialisation**
3. Cliquer sur **Vérifier les tables**
4. Si tout est OK, vous verrez "Les tables existent et sont fonctionnelles !"

## 📝 Notes importantes

- Les types `text[]` pour `countries` permettent de stocker un tableau de pays
- Les types `numeric(10,2)` pour les prix permettent 2 décimales
- Les `timestamptz` incluent le fuseau horaire
- Les valeurs par défaut sont importantes pour le bon fonctionnement

## 🔧 Alternative: Script SQL complet

Si vous préférez créer tout via SQL Editor:

```sql
-- Créer les tables
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  countries TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shipping_zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🚚',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  free_shipping_threshold DECIMAL(10,2),
  estimated_days VARCHAR(50) DEFAULT '3-5 jours',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_shipping_zones_store_id ON public.shipping_zones(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON public.shipping_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_zone_id ON public.shipping_methods(shipping_zone_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_sort ON public.shipping_methods(sort_order);
```
