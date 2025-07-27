# 🌐 GUIDE CONFIGURATION MULTI-DOMAINES SIMPSHOPY

## 🎯 **ARCHITECTURE DOMAINES**

### **Domaine Principal**
- **simpshopy.com** → Plateforme principale
- ***.simpshopy.com** → Sous-domaines pour boutiques

### **Domaines Clients**
- **boutique1.simpshopy.com** → Sous-domaine gratuit
- **boutique-personnalisee.com** → Domaine client personnalisé

---

## 🔧 **ÉTAPE 1 : CONFIGURATION DNS OVH**

### **1. Configuration pour simpshopy.com**

Dans ton panel OVH, configurer :

#### **A. Enregistrements A**
```
simpshopy.com → [IP de ton serveur]
www.simpshopy.com → [IP de ton serveur]
```

#### **B. Wildcard pour sous-domaines**
```
*.simpshopy.com → [IP de ton serveur]
```

#### **C. Configuration Email (Resend)**
```
@ → MX → mxa.resend.com (priorité 10)
@ → TXT → v=spf1 include:spf.resend.com ~all
```

### **2. Configuration pour domaines clients**

#### **CNAME Records**
```
boutique1.simpshopy.com → simpshopy.com
boutique2.simpshopy.com → simpshopy.com
```

---

## 🏗️ **ÉTAPE 2 : SYSTÈME DE ROUTING**

### **Structure de base de données**

```sql
-- Table pour gérer les domaines
CREATE TABLE store_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  domain_type TEXT NOT NULL CHECK (domain_type IN ('subdomain', 'custom')),
  domain_name TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour le routing
CREATE INDEX idx_store_domains_domain_name ON store_domains(domain_name);
CREATE INDEX idx_store_domains_store_id ON store_domains(store_id);
```

### **Logique de routing**

```typescript
// Fonction pour déterminer la boutique par domaine
async function getStoreByDomain(domain: string) {
  // 1. Vérifier si c'est un domaine personnalisé
  const { data: customDomain } = await supabase
    .from('store_domains')
    .select('store_id')
    .eq('domain_name', domain)
    .eq('domain_type', 'custom')
    .eq('is_active', true)
    .single();

  if (customDomain) {
    return customDomain.store_id;
  }

  // 2. Vérifier si c'est un sous-domaine simpshopy.com
  if (domain.endsWith('.simpshopy.com')) {
    const subdomain = domain.replace('.simpshopy.com', '');
    
    const { data: subdomainStore } = await supabase
      .from('store_domains')
      .select('store_id')
      .eq('domain_name', `${subdomain}.simpshopy.com`)
      .eq('domain_type', 'subdomain')
      .eq('is_active', true)
      .single();

    return subdomainStore?.store_id;
  }

  return null;
}
```

---

## 🎨 **ÉTAPE 3 : INTERFACE UTILISATEUR**

### **1. Gestionnaire de domaines dans l'app**

```typescript
// Composant pour gérer les domaines
const DomainManager = ({ storeId }: { storeId: string }) => {
  const [domains, setDomains] = useState([]);
  const [newCustomDomain, setNewCustomDomain] = useState('');

  // Récupérer les domaines de la boutique
  const { data: storeDomains } = useQuery({
    queryKey: ['store-domains', storeId],
    queryFn: () => getStoreDomains(storeId)
  });

  // Ajouter un domaine personnalisé
  const addCustomDomain = async (domain: string) => {
    await supabase
      .from('store_domains')
      .insert({
        store_id: storeId,
        domain_type: 'custom',
        domain_name: domain,
        is_primary: false
      });
  };

  return (
    <div>
      <h3>Domaines de votre boutique</h3>
      
      {/* Domaine par défaut */}
      <div>
        <strong>Domaine par défaut :</strong>
        <code>{storeSlug}.simpshopy.com</code>
      </div>

      {/* Domaines personnalisés */}
      <div>
        <h4>Domaines personnalisés</h4>
        {storeDomains?.filter(d => d.domain_type === 'custom').map(domain => (
          <div key={domain.id}>
            <span>{domain.domain_name}</span>
            <Badge>{domain.is_active ? 'Actif' : 'En attente'}</Badge>
          </div>
        ))}
        
        <Input 
          placeholder="mon-domaine.com"
          value={newCustomDomain}
          onChange={(e) => setNewCustomDomain(e.target.value)}
        />
        <Button onClick={() => addCustomDomain(newCustomDomain)}>
          Ajouter un domaine
        </Button>
      </div>
    </div>
  );
};
```

### **2. Instructions pour les clients**

```markdown
## 🌐 Configuration de votre domaine personnalisé

### **Étape 1 : Acheter votre domaine**
- Allez sur Namecheap, OVH, ou Google Domains
- Achetez votre domaine (ex: ma-boutique.com)

### **Étape 2 : Configurer les DNS**
Ajoutez ces enregistrements dans votre registrar :

#### **Option A : CNAME (Recommandé)**
```
www → simpshopy.com
```

#### **Option B : A Record**
```
@ → [IP de SimpShopy]
www → [IP de SimpShopy]
```

### **Étape 3 : Ajouter dans SimpShopy**
1. Allez dans les paramètres de votre boutique
2. Section "Domaines"
3. Ajoutez votre domaine personnalisé
4. Attendez la validation (24-48h)

### **Étape 4 : Activer**
Une fois validé, votre domaine sera automatiquement activé !
```

---

## 🔄 **ÉTAPE 4 : VALIDATION AUTOMATIQUE**

### **Système de vérification**

```typescript
// Fonction pour vérifier si un domaine pointe vers SimpShopy
async function validateDomain(domain: string) {
  try {
    // Vérifier si le domaine résout vers notre serveur
    const response = await fetch(`https://${domain}/api/health`);
    
    if (response.ok) {
      // Mettre à jour le statut
      await supabase
        .from('store_domains')
        .update({ is_active: true })
        .eq('domain_name', domain);
      
      return true;
    }
  } catch (error) {
    console.error('Domaine non valide:', domain);
    return false;
  }
}

// Vérification périodique
setInterval(async () => {
  const { data: pendingDomains } = await supabase
    .from('store_domains')
    .select('domain_name')
    .eq('is_active', false)
    .eq('domain_type', 'custom');

  for (const domain of pendingDomains || []) {
    await validateDomain(domain.domain_name);
  }
}, 1000 * 60 * 60); // Vérifier toutes les heures
```

---

## 🎯 **AVANTAGES DE CETTE APPROCHE**

### **✅ Pour toi (SimpShopy)**
- **Monétisation** : Services de domaines personnalisés
- **Scalabilité** : Système multi-tenant
- **Professionnalisme** : Plateforme complète

### **✅ Pour tes clients**
- **Gratuit** : Sous-domaine inclus
- **Flexibilité** : Migration vers domaine personnalisé
- **Simplicité** : Configuration automatique

### **✅ Technique**
- **Routage intelligent** : Un seul serveur, plusieurs domaines
- **Validation automatique** : Pas d'intervention manuelle
- **Sécurité** : Isolation entre boutiques

---

## 🚀 **PROCHAINES ÉTAPES**

1. **Configurer DNS OVH** pour simpshopy.com
2. **Créer la table store_domains** dans Supabase
3. **Implémenter le système de routing**
4. **Créer l'interface de gestion des domaines**
5. **Tester avec un domaine personnalisé**

**Veux-tu que je commence par créer la table et le système de routing ?** 🎯 