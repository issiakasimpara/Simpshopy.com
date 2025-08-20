import React from 'react';
import { CheckCircle, Star, Zap, Shield, Globe, Headphones } from 'lucide-react';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  cta: string;
  icon: React.ReactNode;
}

const plans: Plan[] = [
      {
      name: "Starter",
      price: "$29",
      period: "/mois",
      description: "Parfait pour commencer votre aventure e-commerce",
      icon: <Zap className="h-8 w-8 text-blue-500" />,
      features: [
        "1 boutique en ligne",
        "Paiements en devises locales",
        "Support email",
        "Templates de base",
        "Analytics de base",
        "1GB de stockage"
      ],
      popular: false,
      cta: "Commencer maintenant"
    },
    {
      name: "Business",
      price: "$79",
      period: "/mois",
      description: "Pour les entrepreneurs sérieux qui veulent grandir",
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      features: [
        "Boutiques illimitées",
        "Paiements avancés",
        "Support prioritaire",
        "Templates premium",
        "Analytics détaillées",
        "10GB de stockage",
        "Intégrations avancées",
        "Backup automatique"
      ],
      popular: true,
      cta: "Essayer Business gratuitement"
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/mois",
      description: "Solutions personnalisées pour les grandes entreprises",
      icon: <Shield className="h-8 w-8 text-green-500" />,
      features: [
        "Tout du plan Business",
        "API personnalisée",
        "Support dédié 24/7",
        "Intégrations avancées",
        "Formation équipe",
        "Stockage illimité",
        "SLA garanti",
        "Migration gratuite"
      ],
      popular: false,
      cta: "Contacter l'équipe"
    }
];

const features = [
  {
    icon: <Globe className="h-6 w-6 text-blue-500" />,
    title: "Support international",
    description: "Support en français et anglais, 24/7"
  },
  {
    icon: <Shield className="h-6 w-6 text-green-500" />,
    title: "Sécurité maximale",
    description: "Certification PCI DSS et cryptage SSL"
  },
  {
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    title: "Performance optimale",
    description: "Temps de chargement < 2 secondes"
  },
  {
    icon: <Headphones className="h-6 w-6 text-purple-500" />,
    title: "Support expert",
    description: "Équipe d'experts e-commerce dédiée"
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tarifs SimpShopy
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Des tarifs simples et transparents en dollars pour faire grandir votre business e-commerce
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <span>✓ Pas de frais cachés</span>
              <span>✓ Annulation à tout moment</span>
              <span>✓ Support 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir SimpShopy ?
            </h2>
            <p className="text-lg text-gray-600">
              Une plateforme complète pour réussir votre business e-commerce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez passer d'un plan à l'autre à tout moment. Les changements sont appliqués immédiatement.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Y a-t-il des frais de transaction ?
              </h3>
              <p className="text-gray-600">
                Les frais de transaction dépendent de votre processeur de paiement. SimpShopy ne prélève aucun frais supplémentaire.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Le support est-il disponible en français ?
              </h3>
              <p className="text-gray-600">
                Oui, notre équipe de support est disponible en français et en anglais, 24h/24 et 7j/7.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Puis-je annuler mon abonnement ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à lancer votre boutique ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'entrepreneurs qui font confiance à SimpShopy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Commencer gratuitement
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
              Voir la démo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
