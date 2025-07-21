
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section
      className="hero-section relative py-24 px-4 overflow-hidden bg-white"
      style={{
        backgroundImage: 'none',
        position: 'relative',
        isolation: 'isolate'
      }}
    >
      {/* Background with gradient - SEUL background autorisé */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
          backgroundImage: 'none'
        }}
      />
      <div
        className="absolute inset-0 opacity-20 z-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f9ff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />
      
      {/* Couche de protection contre les images parasites */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'transparent',
          mixBlendMode: 'normal'
        }}
      />

      <div className="container mx-auto relative z-20">
        <div
          className="text-center max-w-5xl mx-auto relative z-30"
          style={{ isolation: 'isolate' }}
        >
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            🇲🇱 Fait pour l'Afrique
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in">
            Votre boutique en ligne{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block sm:inline">
              simple et efficace
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto animate-fade-in">
            La plateforme e-commerce <strong className="text-gray-800">adaptée à l'Afrique</strong> qui vous aide à vendre
            en ligne. Paiements mobiles, livraison locale et support en français.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in">
            <Button size="lg" className="px-10 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 group" asChild>
              <Link to="/dashboard">
                Commencer gratuitement
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg border-2 group hover:bg-gray-50">
              <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              Voir la démo
            </Button>
          </div>
          
          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500 animate-fade-in">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Essai gratuit 30 jours
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Paiement mobile money
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Support en français
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
