import { useState } from "react";
import { Smartphone, CreditCard, Building, Banknote } from "lucide-react";

interface PaymentLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Orange Money Logo avec vraie image
export const OrangeMoneyLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-orange-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://change.sn/assets/images/orange_ci.png"
        alt="Orange Money"
        className="w-full h-full object-contain p-1"
        onError={(e) => {
          // Fallback vers le logo stylisé
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div class="text-orange-600 text-center">
              <div class="font-bold text-lg leading-none">OM</div>
              <div class="text-xs opacity-90">Orange</div>
            </div>
          `;
        }}
      />
    </div>
  );
};

// MTN Mobile Money Logo avec vraie image
export const MTNLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-yellow-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmJ3HE2TArNjWyS6gBWEEBEtCAicuJ2M6vWw&s"
        alt="MTN Mobile Money"
        className="w-full h-full object-contain p-1"
        onError={(e) => {
          // Fallback vers le logo stylisé
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div class="text-yellow-600 text-center">
              <div class="font-bold text-lg leading-none">MTN</div>
              <div class="text-xs opacity-80">MoMo</div>
            </div>
          `;
        }}
      />
    </div>
  );
};

// Moov Money Logo avec vraie image
export const MoovLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://www.moov-africa.ml/PublishingImages/contenu/moov-money.png"
        alt="Moov Money"
        className="w-full h-full object-contain p-1"
        onError={(e) => {
          // Fallback vers le logo stylisé
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div class="text-blue-600 text-center">
              <div class="font-bold text-lg leading-none">MOOV</div>
              <div class="text-xs opacity-90">Money</div>
            </div>
          `;
        }}
      />
    </div>
  );
};

// Bank Transfer Logo avec vraie image
export const BankLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-green-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://static.vecteezy.com/ti/vecteur-libre/p1/4753024-icone-de-transfert-filaire-logo-de-transfert-filaire-detaille-ombre-gratuit-vectoriel.jpg"
        alt="Virement bancaire"
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          // Fallback vers le logo stylisé
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div class="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center rounded-2xl">
              <svg class="${iconSizes[size]} text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
          `;
        }}
      />
    </div>
  );
};

// Visa/Mastercard Logo avec vraie image
export const VisaLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-purple-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png"
        alt="Visa Card"
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          // Fallback vers le logo stylisé
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div class="text-purple-600 text-center">
              <div class="font-bold text-sm leading-none">VISA</div>
              <div class="text-xs opacity-90">Card</div>
            </div>
          `;
        }}
      />
    </div>
  );
};

// Cash on Delivery Logo avec vraie image
export const CashLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://img.freepik.com/photos-gratuite/gros-plan-livreur-donnant-colis-au-client_23-2149095900.jpg"
        alt="Paiement à la livraison"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback vers le logo stylisé
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div class="w-full h-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center rounded-2xl">
              <svg class="${iconSizes[size]} text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          `;
        }}
      />
    </div>
  );
};

// Logo avec image réelle (pour les vrais logos)
interface RealLogoProps extends PaymentLogoProps {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
}

export const RealPaymentLogo = ({ src, alt, size = 'md', className = '', fallback }: RealLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const [imageError, setImageError] = useState(false);

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg overflow-hidden relative ${className}`}>
      {!imageError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain p-2"
          onError={() => setImageError(true)}
        />
      ) : (
        fallback || (
          <div className="text-gray-400 text-center">
            <div className="text-xs">Logo</div>
          </div>
        )
      )}
    </div>
  );
};

// Composant principal qui choisit le bon logo
interface PaymentMethodLogoProps {
  method: 'orange' | 'mtn' | 'moov' | 'bank' | 'visa' | 'cash';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  useRealLogo?: boolean;
}

export const PaymentMethodLogo = ({ method, size = 'md', className = '', useRealLogo = false }: PaymentMethodLogoProps) => {
  // URLs des vrais logos
  const realLogos = {
    orange: 'https://change.sn/assets/images/orange_ci.png',
    mtn: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmJ3HE2TArNjWyS6gBWEEBEtCAicuJ2M6vWw&s',
    moov: 'https://www.moov-africa.ml/PublishingImages/contenu/moov-money.png',
    bank: 'https://static.vecteezy.com/ti/vecteur-libre/p1/4753024-icone-de-transfert-filaire-logo-de-transfert-filaire-detaille-ombre-gratuit-vectoriel.jpg',
    visa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png',
    cash: 'https://img.freepik.com/photos-gratuite/gros-plan-livreur-donnant-colis-au-client_23-2149095900.jpg'
  };

  const fallbacks = {
    orange: <OrangeMoneyLogo size={size} />,
    mtn: <MTNLogo size={size} />,
    moov: <MoovLogo size={size} />,
    bank: <BankLogo size={size} />,
    visa: <VisaLogo size={size} />,
    cash: <CashLogo size={size} />
  };

  if (useRealLogo && realLogos[method]) {
    return (
      <RealPaymentLogo 
        src={realLogos[method]}
        alt={`${method} logo`}
        size={size}
        className={className}
        fallback={fallbacks[method]}
      />
    );
  }

  // Utiliser les logos stylisés par défaut
  switch (method) {
    case 'orange':
      return <OrangeMoneyLogo size={size} className={className} />;
    case 'mtn':
      return <MTNLogo size={size} className={className} />;
    case 'moov':
      return <MoovLogo size={size} className={className} />;
    case 'bank':
      return <BankLogo size={size} className={className} />;
    case 'visa':
      return <VisaLogo size={size} className={className} />;
    case 'cash':
      return <CashLogo size={size} className={className} />;
    default:
      return <BankLogo size={size} className={className} />;
  }
};
