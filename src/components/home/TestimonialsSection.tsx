
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Aminata Traoré",
      role: "Fondatrice, Tissus Bamako",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=64&h=64&fit=crop&crop=face",
      content: "Avec Simpshopy, j'ai pu vendre mes tissus traditionnels en ligne. Les paiements Orange Money fonctionnent parfaitement !",
      rating: 5,
      revenue: "+2M CFA en 3 mois"
    },
    {
      name: "Kofi Asante",
      role: "Entrepreneur, Électronique Accra",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      content: "Simple à utiliser, même avec une connexion lente. Mes clients peuvent payer avec MTN Mobile Money sans problème.",
      rating: 5,
      revenue: "500K CFA/mois"
    },
    {
      name: "Fatou Diallo",
      role: "Créatrice, Mode Dakar",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face",
      content: "La boutique se charge rapidement sur mobile. Parfait pour mes clients qui achètent depuis leur téléphone !",
      rating: 5,
      revenue: "Ventes +200%"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Nos entrepreneurs témoignent
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez comment Simpshopy aide les entrepreneurs africains à réussir en ligne
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <Quote className="h-8 w-8 text-blue-600 mb-4 opacity-50" />
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm font-medium text-green-600">{testimonial.revenue}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
