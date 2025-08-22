import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Globe, CreditCard, Package, Palette, Shield, BarChart3, ArrowRight, Users, Quote, Play, Zap, Target, TrendingUp, ShoppingBag, DollarSign, Smartphone, Monitor, Zap as Lightning, Plus, FileText, Settings, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import AppLogo from "@/components/ui/AppLogo";

const Home = () => {
  const testimonials = [
    {
      quote: "J'ai adoré la simplicité du service et ses fonctionnalités pratiques. Elles vont m'aider à vendre mes produits et services en ligne sans effort !",
      author: "Maurice NONTONDJI",
      role: "Linkedin Community Manager"
    },
    {
      quote: "Simpshopy offre une interface intuitive et des outils puissants, comme l'intégration du Pixel Meta Ads. Le système de création de produits est simple et efficace.",
      author: "Godwin SOOLA",
      role: "Digital Marketer"
    },
    {
      quote: "Simpshopy est l'outil idéal pour lancer des produits rapidement sans souci de création de site ou d'intégration de paiements. Interface conviviale et simple.",
      author: "Hermas AYI",
      role: "CoFounder Ibudo"
    }
  ];

  const features = [
    {
      title: "Votre boutique personnalisée en ligne en 2 minutes.",
      description: "Simpshopy vous permet de configurer plusieurs boutiques adaptées à vos différents produits ou services. Choisissez un design, ajoutez vos articles, et vous êtes prêt à vendre.",
      illustration: "boutique",
      icon: ShoppingBag
    },
    {
      title: "Vendez partout, dans plusieurs devises.",
      description: "Avec Simpshopy, vous n'avez pas à vous soucier des transactions. Nous acceptons toutes les principales méthodes de paiement, locales et internationales. Vous recevrez vos gains dans les 72 heures.",
      illustration: "paiements",
      icon: Globe
    },
    {
      title: "Connectez vos outils préférés",
      description: "Synchronisez facilement votre boutique avec vos outils de marketing préférés. Mailchimp, Google Analytics, Facebook Pixel. Connectez-les tous pour optimiser vos campagnes et doubler vos conversions.",
      illustration: "integrations",
      icon: Zap
    },
    {
      title: "Suivez vos ventes et ajustez votre stratégie.",
      description: "Accédez à des statistiques détaillées pour comprendre vos performances, identifier les produits qui fonctionnent le mieux et optimiser vos actions marketing.",
      illustration: "analytics",
      icon: BarChart3
    },
    {
      title: "Une équipe à vos côtés 24h/24 et 7j/7.",
      description: "Nos experts sont à votre disposition pour vous accompagner, que vous ayez besoin d'aide pour configurer votre boutique ou de conseils pour augmenter vos ventes.",
      illustration: "support",
      icon: Headphones
    }
  ];

  const keyFeatures = [
    {
      icon: Shield,
      title: "Protection des paiements",
      description: "Sécurisez vos transactions avec un niveau de protection enterprise."
    },
    {
      icon: Zap,
      title: "Workflows automatisés",
      description: "Soyez plus efficaces grâce aux workflows. Idéal pour les ventes incitatives et bien plus encore !"
    },
    {
      icon: DollarSign,
      title: "Codes de réduction",
      description: "Offrez à vos clients des réductions sur vos produits avec une flexibilité totale."
    },
    {
      icon: Lightning,
      title: "Pulse",
      description: "Communiquez vos ventes à vos outils préférés en temps réel et conservez votre flux de travail intact."
    },
    {
      icon: TrendingUp,
      title: "Campagnes",
      description: "Mesurez l'impact réel de chaque action marketing et optimisez votre ROI grâce à une meilleure traçabilité."
    }
  ];

  const comparisonData = [
    {
      feature: "Paiements locaux (Mobile Money, Wave, etc.)",
      simpshopy: "✅ Inclus",
      wordpress: "❌ Plugins complexes",
      shopify: "❌ Non natif"
    },
    {
      feature: "Multi-devises & multi-langues",
      simpshopy: "✅ Automatique",
      wordpress: "❌ Manuel",
      shopify: "✅ Payant"
    },
    {
      feature: "Simplicité d'installation",
      simpshopy: "✅ 2 minutes",
      wordpress: "❌ Complexe",
      shopify: "✅ Rapide"
    },
    {
      feature: "Tarifs transparents",
      simpshopy: "✅ $29/mois",
      wordpress: "❌ Plugins cachés",
      shopify: "❌ Frais cachés"
    },
    {
      feature: "Support dédié 24/7",
      simpshopy: "✅ WhatsApp + email",
      wordpress: "❌ Communauté",
      shopify: "✅ Premium uniquement"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Créez",
      description: "Uploadez vos produits numériques et configurez votre boutique."
    },
    {
      number: "2",
      title: "Partagez",
      description: "Diffusez votre lien de vente unique sur vos réseaux."
    },
    {
      number: "3",
      title: "Gagnez",
      description: "Recevez vos paiements instantanément après chaque vente."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="SimpShopy - La plateforme tout en un pour vendre vos produits digitaux"
        description="Créez et vendez vos produits digitaux partout dans le monde sans stress. De la mise en ligne au reversement de vos gains, nous gérons tout."
        keywords="boutique en ligne, e-commerce, plateforme vente, produits digitaux, paiements internationaux"
        type="website"
      />

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <AppLogo />
            <nav className="hidden md:flex items-center space-x-10">
              <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-lg">Fonctionnalités</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-lg">Tarifs</Link>
              <Link to="/testimonials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-lg">Témoignages</Link>
              <Link to="/why-choose-us" className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-lg">Pourquoi nous choisir</Link>
              <Link to="/support" className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-lg">Support</Link>
            </nav>
            <div className="flex items-center space-x-6">
              <Button variant="ghost" asChild className="text-lg">
                <Link to="/auth">Connexion</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/auth">Vendre</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 mb-12 shadow-lg">
              <span className="text-sm font-medium text-gray-700">🚀 Nouveau : Paiements Mobile Money intégrés</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-serif font-bold text-gray-900 mb-8 leading-tight">
              La plateforme tout en un pour{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
                vendre vos produits digitaux
              </span>
            </h1>
            
            <p className="text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Créez et vendez vos produits digitaux partout dans le monde sans stress. 
              De la mise en ligne au reversement de vos gains, nous gérons tout.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 font-medium">
                Créez ma boutique
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button size="lg" variant="outline" className="text-xl px-10 py-6 rounded-2xl border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-300 transition-all duration-300 font-medium">
                <Play className="mr-3 h-6 w-6" />
                Visitez la démo
              </Button>
            </div>
            
            <p className="text-lg text-gray-500 mb-12">✨ Aucune carte bancaire requise • Configuration en 2 minutes</p>
            
            {/* Social proof */}
            <div className="border-t border-gray-200/50 pt-12">
              <p className="text-lg text-gray-600 mb-6">Faites confiance à la plateforme utilisée par des entrepreneurs dans +20 pays</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-3xl">🇫🇷 🇺🇸 🇨🇦 🇬🇧 🇩🇪 🇪🇸 🇮🇹 🇳🇱 🇧🇪 🇨🇭 🇦🇹 🇸🇪 🇳🇴 🇩🇰 🇫🇮 🇵🇱 🇨🇿 🇭🇺 🇷🇴 🇧🇬</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-gray-900 mb-6">Ils réussissent avec Simpshopy</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Découvrez les témoignages de nos clients satisfaits</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-2xl bg-white hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden">
                <CardContent className="p-10">
                  <Quote className="h-10 w-10 text-blue-500 mb-8" />
                  <p className="text-gray-700 mb-8 italic text-xl leading-relaxed font-light">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-6">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{testimonial.author}</div>
                      <div className="text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Sections */}
      {features.map((feature, index) => (
        <section key={index} className={`py-32 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className={index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
                <h2 className="text-5xl font-serif font-bold text-gray-900 mb-8 leading-tight">
                  {feature.title}
                </h2>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                  {feature.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 font-medium">
                    Créez une boutique gratuite
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                  {index === 1 || index === 2 ? (
                    <Button size="lg" variant="ghost" className="text-xl px-8 py-6 text-blue-600 font-medium hover:bg-blue-50 rounded-2xl">
                      En savoir plus
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className={index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}>
                {/* Sophisticated SVG Illustrations */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 h-[500px] flex items-center justify-center shadow-2xl border border-blue-100">
                    {feature.illustration === 'boutique' && <BoutiqueIllustration />}
                    {feature.illustration === 'paiements' && <PaiementsIllustration />}
                    {feature.illustration === 'integrations' && <IntegrationsIllustration />}
                    {feature.illustration === 'analytics' && <AnalyticsIllustration />}
                    {feature.illustration === 'support' && <SupportIllustration />}
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-2xl opacity-80 animate-bounce"></div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-400 rounded-2xl opacity-80 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Key Features Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-gray-900 mb-6">Fonctionnalités clés</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Tout ce dont vous avez besoin pour réussir en ligne</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {keyFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-2xl bg-white hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden group">
                <CardHeader className="pb-6 p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-10 w-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-serif text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-gray-600 leading-relaxed text-lg font-light">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
            <Card className="border-0 shadow-2xl bg-white hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden group">
              <CardHeader className="pb-6 p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <PlusIcon className="h-10 w-10 text-gray-600" />
                </div>
                <CardTitle className="text-2xl font-serif text-gray-900">Et plus encore</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <p className="text-gray-600 leading-relaxed text-lg font-light">
                  Explorez nos fonctionnalités avancées comme les noms de domaines personnalisés, 
                  le multi-devises et bien d'autres pour développer votre business.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-gray-900 mb-6">Simpshopy vs les autres</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Découvrez pourquoi Simpshopy est le choix numéro 1</p>
          </div>
          <div className="overflow-x-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid grid-cols-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="p-8 font-semibold text-xl">Fonctionnalités</div>
                <div className="p-8 font-semibold text-xl text-center">Simpshopy</div>
                <div className="p-8 font-semibold text-xl text-center opacity-90">WordPress + WooCommerce</div>
                <div className="p-8 font-semibold text-xl text-center opacity-90">Shopify</div>
              </div>
              {comparisonData.map((row, index) => (
                <div key={index} className={`grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === comparisonData.length - 1 ? 'border-b-0' : ''}`}>
                  <div className="p-8 text-gray-700 font-medium text-lg">{row.feature}</div>
                  <div className="p-8 text-center">
                    <span className="text-green-600 font-semibold text-lg">{row.simpshopy}</span>
                  </div>
                  <div className="p-8 text-center">
                    <span className="text-red-500 font-semibold text-lg">{row.wordpress}</span>
                  </div>
                  <div className="p-8 text-center">
                    <span className={`font-semibold text-lg ${row.shopify.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
                      {row.shopify}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 font-medium">
              Choisir Simpshopy
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-gray-900 mb-6">Comment ça marche ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">En seulement 3 étapes simples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-16">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-10">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <span className="text-3xl font-bold text-white">{step.number}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform translate-x-8"></div>
                  )}
                </div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg font-light">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-serif font-bold text-white mb-8">
            Commencez à vendre des produits digitaux dès aujourd'hui !
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Rejoignez des milliers d'entrepreneurs qui font confiance à Simpshopy
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 font-bold">
            Créez votre boutique
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <AppLogo />
              <p className="text-gray-400 mt-6 leading-relaxed text-lg">
                La plateforme tout en un pour vendre vos produits digitaux.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Ressources</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/support" className="hover:text-white transition-colors text-lg">Support</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors text-lg">Tarifs</Link></li>
                <li><Link to="/features" className="hover:text-white transition-colors text-lg">Fonctionnalités</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Legal</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors text-lg">Politique de confidentialité</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors text-lg">Termes et conditions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Entreprise</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors text-lg">À propos</Link></li>
                <li><Link to="/why-choose-us" className="hover:text-white transition-colors text-lg">Pourquoi nous choisir</Link></li>
                <li><Link to="/testimonials" className="hover:text-white transition-colors text-lg">Témoignages</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-12 text-center text-gray-400">
            <p className="text-lg">Simpshopy est un service de SimpShopy SAS, une société française enregistrée.</p>
            <p className="mt-4 text-lg">&copy; 2024 SimpShopy. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

// Composant PlusIcon pour l'icône
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

// Illustrations SVG sophistiquées
const BoutiqueIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-80 h-80">
      {/* Dashboard principal */}
      <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            <div className="text-sm font-semibold text-gray-800">Ma Boutique</div>
          </div>
          <div className="w-6 h-6 bg-green-500 rounded-full"></div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-medium">Ventes</div>
            <div className="text-lg font-bold text-gray-800">€2,450</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs text-purple-600 font-medium">Commandes</div>
            <div className="text-lg font-bold text-gray-800">24</div>
          </div>
        </div>
        
        {/* Product list */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-800">Produit Digital #1</div>
              <div className="text-xs text-gray-500">€29.99</div>
            </div>
            <div className="text-xs text-green-600 font-medium">+12</div>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-800">Formation Premium</div>
              <div className="text-xs text-gray-500">€99.99</div>
            </div>
            <div className="text-xs text-green-600 font-medium">+8</div>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
    </div>
  </div>
);

const PaiementsIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-80 h-80">
      {/* Payment interface */}
      <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-sm font-semibold text-gray-800 mb-2">Paiement Sécurisé</div>
          <div className="text-lg font-bold text-gray-900">€29.99</div>
        </div>
        
        {/* Payment methods */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-500">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
              <div className="text-sm font-medium text-gray-800">Visa/Mastercard</div>
            </div>
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <div className="text-sm font-medium text-gray-800">Mobile Money</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
              <div className="text-sm font-medium text-gray-800">PayPal</div>
            </div>
          </div>
        </div>
        
        {/* Security badge */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>Paiement sécurisé SSL</span>
        </div>
      </div>
      
      {/* Floating cards */}
      <div className="absolute -top-4 -right-4 w-16 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg shadow-lg transform rotate-12"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-lg transform -rotate-12"></div>
    </div>
  </div>
);

const IntegrationsIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-80 h-80">
      {/* Integration dashboard */}
      <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-sm font-semibold text-gray-800">Intégrations</div>
        </div>
        
        {/* Connected services */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-red-50 rounded-lg p-3 border-2 border-red-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <div className="text-xs font-medium text-gray-800">Mailchimp</div>
            </div>
            <div className="text-xs text-green-600">✓ Connecté</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <div className="text-xs font-medium text-gray-800">Google Analytics</div>
            </div>
            <div className="text-xs text-green-600">✓ Connecté</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <div className="text-xs font-medium text-gray-800">Facebook Pixel</div>
            </div>
            <div className="text-xs text-green-600">✓ Connecté</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <div className="text-xs font-medium text-gray-800">Zapier</div>
            </div>
            <div className="text-xs text-gray-500">+ Connecter</div>
          </div>
        </div>
        
        {/* Connection lines */}
        <div className="relative h-8">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
    </div>
  </div>
);

const AnalyticsIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-80 h-80">
      {/* Analytics dashboard */}
      <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-semibold text-gray-800">Analytics</div>
          <div className="text-xs text-green-600 font-medium">+23%</div>
        </div>
        
        {/* Chart */}
        <div className="mb-6">
          <div className="flex items-end justify-between h-20 space-x-1">
            <div className="w-4 bg-blue-500 rounded-t" style={{height: '60%'}}></div>
            <div className="w-4 bg-blue-500 rounded-t" style={{height: '80%'}}></div>
            <div className="w-4 bg-blue-500 rounded-t" style={{height: '45%'}}></div>
            <div className="w-4 bg-blue-500 rounded-t" style={{height: '90%'}}></div>
            <div className="w-4 bg-blue-500 rounded-t" style={{height: '70%'}}></div>
            <div className="w-4 bg-blue-500 rounded-t" style={{height: '85%'}}></div>
            <div className="w-4 bg-blue-500 rounded-t" style={{height: '95%'}}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-medium">Visiteurs</div>
            <div className="text-lg font-bold text-gray-800">1,234</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-600 font-medium">Conversions</div>
            <div className="text-lg font-bold text-gray-800">12.5%</div>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
    </div>
  </div>
);

const SupportIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-80 h-80">
      {/* Support interface */}
      <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-sm font-semibold text-gray-800">Support 24/7</div>
        </div>
        
        {/* Chat interface */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white text-xs p-2 rounded-lg max-w-32">
              Bonjour, j'ai besoin d'aide
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 text-xs p-2 rounded-lg max-w-32">
              Bonjour ! Comment puis-je vous aider ?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white text-xs p-2 rounded-lg max-w-32">
              Problème de paiement
            </div>
          </div>
        </div>
        
        {/* Support channels */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="text-xs font-medium text-gray-800">WhatsApp</div>
            </div>
            <div className="text-xs text-green-600">En ligne</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <div className="text-xs font-medium text-gray-800">Email</div>
            </div>
            <div className="text-xs text-blue-600">Réponse &lt; 2h</div>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
    </div>
  </div>
);

export default Home;
