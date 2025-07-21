# 🎨 Guide d'Intégration du Logo Simpshopy

## 📁 Étape 1 : Placer le fichier logo

1. **Copiez votre fichier** `WhatsApp_Image_2025-07-21_à_20.46.28_ae8f7ed6-removebg-preview.png`
2. **Renommez-le** en `logo-simpshopy.png`
3. **Placez-le** dans le dossier `public/` de votre projet :

```
votre-projet/
├── public/
│   ├── logo-simpshopy.png  ← ICI
│   └── ...
├── src/
└── ...
```

## 🔧 Étape 2 : Le composant AppLogo a été mis à jour

Le composant `src/components/ui/AppLogo.tsx` a été automatiquement modifié pour :

✅ **Utiliser votre vrai logo** au lieu de l'icône générique
✅ **Fallback intelligent** si l'image ne charge pas
✅ **Tailles responsives** (sm, md, lg)
✅ **Design professionnel** avec ombre et arrière-plan blanc

## 🎯 Utilisation

### Utilisation basique (avec votre logo) :
```jsx
<AppLogo />
```

### Utilisation avec options :
```jsx
<AppLogo 
  size="lg" 
  showText={true} 
  useRealLogo={true} 
/>
```

### Utilisation avec l'icône générique :
```jsx
<AppLogo useRealLogo={false} />
```

## 📍 Où le logo apparaît

Votre logo sera automatiquement visible dans :

- ✅ **Header de la page d'accueil**
- ✅ **Sidebar du dashboard**
- ✅ **Page de connexion**
- ✅ **Toutes les pages administratives**
- ✅ **Emails et notifications**

## 🎨 Optimisations recommandées

### 1. **Formats multiples** (optionnel)
Créez plusieurs versions pour une meilleure performance :

```
public/
├── logo-simpshopy.png      ← Version principale
├── logo-simpshopy.webp     ← Version optimisée
├── logo-simpshopy-sm.png   ← Version petite (32x32)
└── logo-simpshopy-lg.png   ← Version grande (128x128)
```

### 2. **Favicon** (recommandé)
Créez un favicon à partir de votre logo :

```
public/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
└── apple-touch-icon.png
```

## 🧪 Test

Pour tester que votre logo fonctionne :

1. **Placez le fichier** dans `public/logo-simpshopy.png`
2. **Redémarrez le serveur** : `npm run dev`
3. **Visitez** `http://localhost:8081`
4. **Vérifiez** que votre logo apparaît dans le header

## 🔧 Dépannage

### ❌ Le logo ne s'affiche pas
- Vérifiez que le fichier est bien dans `public/logo-simpshopy.png`
- Vérifiez que le nom du fichier est exact (sensible à la casse)
- Redémarrez le serveur de développement

### ❌ Le logo est trop grand/petit
Modifiez les classes CSS dans `AppLogo.tsx` :

```typescript
// Pour ajuster la taille
logo: "h-8 w-8",  // Changez ces valeurs
```

### ❌ Le logo a un mauvais aspect
- Vérifiez que le fond est bien transparent
- Optimisez la résolution (recommandé : 128x128px minimum)

## 🚀 Prochaines étapes

Une fois le logo intégré :

1. **Testez sur toutes les pages**
2. **Créez un favicon** à partir du logo
3. **Optimisez les performances** avec WebP
4. **Ajoutez le logo** dans les emails/notifications

---

**✅ Votre logo Simpshopy sera maintenant visible partout dans l'application !**
