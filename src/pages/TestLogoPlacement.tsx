import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const TestLogoPlacement = () => {
  const logoLocations = [
    {
      name: "Page d'accueil",
      path: "/",
      status: "✅ Intégré",
      description: "Header principal avec AppLogo",
      color: "green"
    },
    {
      name: "Dashboard Sidebar",
      path: "/dashboard",
      status: "✅ Intégré",
      description: "Sidebar gauche avec AppLogo",
      color: "green"
    },
    {
      name: "Page de connexion",
      path: "/auth",
      status: "✅ Intégré",
      description: "Header de connexion avec AppLogo",
      color: "green"
    },
    {
      name: "Configuration boutique",
      path: "/store-config",
      status: "✅ Hérité",
      description: "Utilise DashboardLayout (logo inclus)",
      color: "green"
    },
    {
      name: "Gestion produits",
      path: "/products",
      status: "✅ Hérité",
      description: "Utilise DashboardLayout (logo inclus)",
      color: "green"
    },
    {
      name: "Commandes",
      path: "/orders",
      status: "✅ Hérité",
      description: "Utilise DashboardLayout (logo inclus)",
      color: "green"
    },
    {
      name: "Analytics",
      path: "/analytics",
      status: "✅ Hérité",
      description: "Utilise DashboardLayout (logo inclus)",
      color: "green"
    },
    {
      name: "Paramètres",
      path: "/settings",
      status: "✅ Hérité",
      description: "Utilise DashboardLayout (logo inclus)",
      color: "green"
    },
    {
      name: "Boutiques publiques",
      path: "/store/ma-boutique",
      status: "⚠️ Spécifique",
      description: "Logo de la boutique individuelle",
      color: "yellow"
    },
    {
      name: "Favicon navigateur",
      path: "Onglet navigateur",
      status: "✅ Intégré",
      description: "Favicon dans index.html",
      color: "green"
    }
  ];

  const getStatusBadge = (status: string, color: string) => {
    const colors = {
      green: "bg-green-100 text-green-800 border-green-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      red: "bg-red-100 text-red-800 border-red-200"
    };

    return (
      <Badge variant="outline" className={colors[color as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Vérification du Placement du Logo
          </h1>
          <p className="text-gray-600">
            État de l'intégration du logo Simpshopy dans toute l'application
          </p>
        </div>

        {/* Résumé */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Résumé de l'Intégration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {logoLocations.filter(l => l.color === 'green').length}
                </div>
                <div className="text-sm text-green-700">Pages avec logo</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {logoLocations.filter(l => l.color === 'yellow').length}
                </div>
                <div className="text-sm text-yellow-700">Cas spéciaux</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {logoLocations.length}
                </div>
                <div className="text-sm text-blue-700">Total vérifié</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste détaillée */}
        <Card>
          <CardHeader>
            <CardTitle>État Détaillé par Page</CardTitle>
            <CardDescription>
              Cliquez sur les liens pour vérifier visuellement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logoLocations.map((location, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-gray-900">{location.name}</h3>
                      {getStatusBadge(location.status, location.color)}
                    </div>
                    <p className="text-sm text-gray-600">{location.description}</p>
                    {location.path.startsWith('/') && (
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                        {location.path}
                      </code>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {location.path.startsWith('/') && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={location.path}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Vérifier
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instructions de Vérification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">✅ Pages à vérifier</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>1. Cliquez sur "Vérifier" pour chaque page</li>
                  <li>2. Confirmez que le logo Simpshopy apparaît</li>
                  <li>3. Vérifiez que le texte est gris</li>
                  <li>4. Testez sur mobile et desktop</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">🔧 Si le logo ne s'affiche pas</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>1. Vérifiez que <code>logo-simpshopy.png</code> est dans <code>public/</code></li>
                  <li>2. Redémarrez le serveur de développement</li>
                  <li>3. Videz le cache du navigateur (Ctrl+F5)</li>
                  <li>4. Vérifiez la console pour les erreurs</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">🎯 Test Rapide</h4>
              <p className="text-sm text-blue-800 mb-3">
                Visitez ces pages principales pour confirmer l'intégration :
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/">Accueil</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Connexion</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/test-logo">Test Logo</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestLogoPlacement;
