import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Store, ShoppingCart, CreditCard, Globe, Palette } from 'lucide-react';

const Demo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5" />
              <span>Retour à l'accueil</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Démonstration Simpshopy</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Découvrez Simpshopy en Action
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Une plateforme e-commerce complète pour créer et gérer votre boutique en ligne
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Store className="h-8 w-8 text-blue-600" />
                  <CardTitle>Gestion de Boutique</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Créez et gérez votre boutique en ligne avec des outils puissants et intuitifs.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                  <CardTitle>Gestion des Produits</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ajoutez, modifiez et organisez vos produits avec des variantes et des images.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                  <CardTitle>Paiements Sécurisés</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Intégration avec les principales méthodes de paiement pour des transactions sécurisées.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Globe className="h-8 w-8 text-orange-600" />
                  <CardTitle>Domaine Personnalisé</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Utilisez votre propre nom de domaine pour une identité de marque professionnelle.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Palette className="h-8 w-8 text-pink-600" />
                  <CardTitle>Thèmes Personnalisables</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Choisissez parmi de nombreux thèmes ou créez le vôtre avec notre éditeur visuel.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Store className="h-8 w-8 text-indigo-600" />
                  <CardTitle>Analytics Avancés</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Suivez vos performances avec des analyses détaillées et des rapports en temps réel.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="py-12">
                <h3 className="text-3xl font-bold mb-4">
                  Prêt à Commencer ?
                </h3>
                <p className="text-xl mb-8 opacity-90">
                  Rejoignez des milliers de commerçants qui font confiance à Simpshopy
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    asChild
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <Link to="/auth">
                      Créer mon compte gratuitement
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    asChild
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    <Link to="/">
                      En savoir plus
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;
