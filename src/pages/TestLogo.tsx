import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLogo from '@/components/ui/AppLogo';

const TestLogo = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 Test du Logo Simpshopy
          </h1>
          <p className="text-gray-600">
            Vérification de l'affichage du logo dans différentes tailles et configurations
          </p>
        </div>

        {/* Test des tailles */}
        <Card>
          <CardHeader>
            <CardTitle>Tailles du Logo</CardTitle>
            <CardDescription>
              Test des différentes tailles disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="text-center space-y-4">
                <h3 className="font-medium text-gray-700">Petite (sm)</h3>
                <div className="flex justify-center">
                  <AppLogo size="sm" useRealLogo={true} />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="font-medium text-gray-700">Moyenne (md)</h3>
                <div className="flex justify-center">
                  <AppLogo size="md" useRealLogo={true} />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="font-medium text-gray-700">Grande (lg)</h3>
                <div className="flex justify-center">
                  <AppLogo size="lg" useRealLogo={true} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test avec/sans texte */}
        <Card>
          <CardHeader>
            <CardTitle>Avec et Sans Texte</CardTitle>
            <CardDescription>
              Comparaison des versions avec et sans le nom de l'application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-center space-y-4">
                <h3 className="font-medium text-gray-700">Avec texte</h3>
                <div className="flex justify-center">
                  <AppLogo size="md" showText={true} useRealLogo={true} />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="font-medium text-gray-700">Sans texte</h3>
                <div className="flex justify-center">
                  <AppLogo size="md" showText={false} useRealLogo={true} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test logo vs icône */}
        <Card>
          <CardHeader>
            <CardTitle>Logo vs Icône Générique</CardTitle>
            <CardDescription>
              Comparaison entre votre logo et l'icône générique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-center space-y-4">
                <h3 className="font-medium text-gray-700">Votre Logo</h3>
                <div className="flex justify-center">
                  <AppLogo size="md" useRealLogo={true} />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="font-medium text-gray-700">Icône Générique</h3>
                <div className="flex justify-center">
                  <AppLogo size="md" useRealLogo={false} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test sur différents arrière-plans */}
        <Card>
          <CardHeader>
            <CardTitle>Test sur Différents Arrière-plans</CardTitle>
            <CardDescription>
              Vérification de la lisibilité sur différentes couleurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 bg-white border rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-3">Blanc</p>
                <AppLogo size="sm" useRealLogo={true} />
              </div>
              
              <div className="p-6 bg-gray-100 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-3">Gris clair</p>
                <AppLogo size="sm" useRealLogo={true} />
              </div>
              
              <div className="p-6 bg-blue-600 rounded-lg text-center">
                <p className="text-xs text-white mb-3">Bleu</p>
                <AppLogo size="sm" useRealLogo={true} />
              </div>
              
              <div className="p-6 bg-gray-900 rounded-lg text-center">
                <p className="text-xs text-white mb-3">Sombre</p>
                <AppLogo size="sm" useRealLogo={true} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations techniques */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ Informations Techniques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Fichier Logo</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Chemin :</strong> <code>/public/logo-simpshopy.png</code></li>
                  <li>• <strong>Format :</strong> PNG avec fond transparent</li>
                  <li>• <strong>Fallback :</strong> Icône Store si erreur</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Tailles Disponibles</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>sm :</strong> 24x24px (h-6 w-6)</li>
                  <li>• <strong>md :</strong> 32x32px (h-8 w-8)</li>
                  <li>• <strong>lg :</strong> 40x40px (h-10 w-10)</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">✅ Instructions</h4>
              <ol className="text-sm text-green-800 space-y-1">
                <li>1. Placez votre fichier logo dans <code>public/logo-simpshopy.png</code></li>
                <li>2. Redémarrez le serveur de développement</li>
                <li>3. Rafraîchissez cette page pour voir votre logo</li>
                <li>4. Si le logo ne s'affiche pas, vérifiez le nom du fichier</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestLogo;
