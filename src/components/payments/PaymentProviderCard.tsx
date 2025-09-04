import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentProviderConfig } from '@/hooks/usePaymentConfigurations';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Settings } from 'lucide-react';

interface PaymentProviderCardProps {
  provider: PaymentProviderConfig;
  isConfigured?: boolean;
  isEnabled?: boolean;
}

const PaymentProviderCard: React.FC<PaymentProviderCardProps> = ({ 
  provider, 
  isConfigured = false, 
  isEnabled = false 
}) => {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    if (isEnabled) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <Zap className="w-3 h-3 mr-1" />
          Actif
        </Badge>
      );
    }
    if (isConfigured) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Settings className="w-3 h-3 mr-1" />
          Configuré
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-gray-600">
        Non configuré
      </Badge>
    );
  };

  const getStatusColor = () => {
    if (isEnabled) return 'text-green-600';
    if (isConfigured) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div
      className="bg-white dark:bg-card rounded-xl shadow hover:shadow-lg transition p-4 sm:p-5 lg:p-6 flex flex-col items-start border border-muted/30 cursor-pointer group"
      onClick={() => navigate(`/payments/${provider.id}`)}
      style={{ minHeight: '220px' }}
    >
      <div className="flex items-center gap-3 mb-3 w-full">
        <div className={`w-36 h-36 rounded-xl flex items-center justify-center ${provider.id === 'moneroo' ? '' : provider.color}`}>
          {provider.id === 'moneroo' ? (
            <img 
              src="/moneroo-logo.svg" 
              alt="Moneroo Logo" 
              className="w-36 h-36 object-contain"
            />
          ) : (
            <span>{provider.icon}</span>
          )}
        </div>
        <div className="ml-auto">
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="font-semibold text-lg sm:text-xl mb-2 group-hover:text-blue-700 transition-colors">
        {provider.id === 'moneroo' ? '' : provider.name}
      </div>
      
      <div className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {provider.description}
      </div>

      <div className="space-y-2 mb-4 w-full">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Frais</span>
          <span className="font-medium">{provider.fees}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Devises</span>
          <span className="font-medium">{provider.supportedCurrencies?.join(', ')}</span>
        </div>
      </div>

      <div className="mt-auto w-full">
        <button
          className={`w-full px-4 py-2 rounded-lg font-medium transition text-sm ${
            isConfigured 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/payments/${provider.id}`);
          }}
        >
          {isConfigured ? 'Configurer' : 'Configurer'}
        </button>
      </div>
    </div>
  );
};

export default PaymentProviderCard;
