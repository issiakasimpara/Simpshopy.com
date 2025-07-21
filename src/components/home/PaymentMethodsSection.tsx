import { Card, CardContent } from "@/components/ui/card";
import { PaymentMethodLogo } from "@/components/ui/PaymentLogos";

const PaymentMethodsSection = () => {
  const paymentMethods = [
    {
      logoType: "orange" as const,
      name: "Orange Money",
      description: "Paiements mobiles Orange",
      countries: ["Mali", "Sénégal", "Côte d'Ivoire", "Burkina Faso"]
    },
    {
      logoType: "mtn" as const,
      name: "MTN Mobile Money",
      description: "Paiements mobiles MTN",
      countries: ["Ghana", "Côte d'Ivoire", "Cameroun", "Ouganda"]
    },
    {
      logoType: "moov" as const,
      name: "Moov Money",
      description: "Paiements mobiles Moov",
      countries: ["Bénin", "Togo", "Côte d'Ivoire", "Mali"]
    },
    {
      logoType: "bank" as const,
      name: "Virements bancaires",
      description: "Banques locales",
      countries: ["Toute l'Afrique de l'Ouest"]
    },
    {
      logoType: "visa" as const,
      name: "Cartes Visa/Mastercard",
      description: "Cartes bancaires internationales",
      countries: ["International"]
    },
    {
      logoType: "cash" as const,
      name: "Paiement à la livraison",
      description: "Cash à la réception",
      countries: ["Zones urbaines"]
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Moyens de paiement adaptés à l'Afrique
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Acceptez tous les moyens de paiement populaires en Afrique de l'Ouest. 
            Vos clients peuvent payer comme ils le souhaitent.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paymentMethods.map((method, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardContent className="p-6">
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                  <PaymentMethodLogo method={method.logoType} size="md" useRealLogo={true} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {method.name}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {method.description}
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Disponible dans :</p>
                  <div className="flex flex-wrap gap-1">
                    {method.countries.map((country, countryIndex) => (
                      <span 
                        key={countryIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
            <span className="font-medium">Intégration automatique • Commissions transparentes • Support technique inclus</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentMethodsSection;
