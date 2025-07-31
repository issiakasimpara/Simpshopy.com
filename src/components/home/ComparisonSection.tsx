import { CheckCircle, Star, DollarSign, Globe, Users, Zap, Shield, Heart, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ComparisonSection = () => {
  const reasons = [
    {
      icon: Globe,
      title: "Spécialement conçu pour l'Afrique",
      description: "Paiements Mobile Money, devises africaines, conformité réglementaire locale"
    },
    {
      icon: DollarSign,
      title: "Prix abordables en devises locales",
      description: "Pas de frais cachés, tarifs transparents en devises africaines, accessible à tous"
    },
    {
      icon: Users,
      title: "Support multilingue 24/7",
      description: "Équipe locale en français et anglais qui comprend vos besoins"
    },
    {
      icon: Zap,
      title: "Configuration en 2 minutes",
      description: "Interface intuitive, pas besoin de connaissances techniques"
    },
    {
      icon: Shield,
      title: "Conformité locale garantie",
      description: "Respect des réglementations africaines et européennes"
    },
    {
      icon: Star,
      title: "Fonctionnalités africaines",
      description: "Mobile Money, livraison locale, marketing adapté au marché"
    },
    {
      icon: Heart,
      title: "Communauté africaine",
      description: "Réseau d'entrepreneurs africains, partage d'expériences"
    },
    {
      icon: Award,
      title: "Formation gratuite",
      description: "Webinaires, tutoriels, accompagnement personnalisé"
    },
    {
      icon: Clock,
      title: "Mise en ligne rapide",
      description: "Votre boutique en ligne en moins de 5 minutes"
    }
  ];

  const stats = [
    {
      number: "1,500+",
      label: "Boutiques créées"
    },
    {
      number: "25K+",
      label: "Ventes réalisées"
    },
    {
      number: "10+",
      label: "Pays couverts"
    },
    {
      number: "4.8/5",
      label: "Note client"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Découvrez ce qui rend SimpShopy unique pour les entrepreneurs africains
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Reasons Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {reasons.map((reason, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <reason.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{reason.title}</h3>
                <p className="text-gray-600 leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <blockquote className="text-xl text-gray-700 italic mb-6">
                "SimpShopy m'a permis de créer ma boutique en ligne en quelques minutes. 
                Les paiements Mobile Money et le support en français ont fait toute la différence !"
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Mariam Diallo</div>
                  <div className="text-sm text-gray-600">Entrepreneuse, Côte d'Ivoire</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
              <Link to="/dashboard">
                Commencer gratuitement avec SimpShopy
              </Link>
            </Button>
            <p className="text-gray-600 mt-4 text-sm">
              Aucune carte de crédit requise • Essai gratuit 30 jours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection; 