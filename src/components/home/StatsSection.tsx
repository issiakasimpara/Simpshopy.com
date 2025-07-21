
import { TrendingUp, Users, Store, Globe } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Store,
      number: "100+",
      label: "Boutiques créées",
      description: "Entrepreneurs nous font confiance"
    },
    {
      icon: TrendingUp,
      number: "50M+ CFA",
      label: "Chiffre d'affaires généré",
      description: "Pour nos clients en 2024"
    },
    {
      icon: Users,
      number: "5K+",
      label: "Clients satisfaits",
      description: "Achats réalisés sur nos plateformes"
    },
    {
      icon: Globe,
      number: "8",
      label: "Pays couverts",
      description: "Afrique de l'Ouest"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Des résultats qui parlent
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rejoignez des milliers d'entrepreneurs qui ont transformé leur vision en succès
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-6 group-hover:shadow-lg transition-shadow">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
