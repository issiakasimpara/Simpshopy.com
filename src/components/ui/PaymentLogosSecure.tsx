import { useState } from "react";
import { Smartphone, CreditCard, Building, Banknote, Bitcoin } from "lucide-react";

interface PaymentLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// 🔐 Fonction utilitaire pour créer des fallbacks sécurisés
const createSecureFallback = (parent: HTMLElement, text: string, colorClass: string, subtext?: string) => {
  parent.innerHTML = '';
  
  const fallbackDiv = document.createElement('div');
  fallbackDiv.className = `${colorClass} text-center`;
  
  const textDiv = document.createElement('div');
  textDiv.className = 'font-bold text-lg leading-none';
  textDiv.textContent = text;
  
  fallbackDiv.appendChild(textDiv);
  
  if (subtext) {
    const subtextDiv = document.createElement('div');
    subtextDiv.className = 'text-xs opacity-90';
    subtextDiv.textContent = subtext;
    fallbackDiv.appendChild(subtextDiv);
  }
  
  parent.appendChild(fallbackDiv);
};

// 🔐 Fonction utilitaire pour créer des fallbacks avec icônes sécurisés
const createSecureIconFallback = (parent: HTMLElement, iconClass: string, bgClass: string) => {
  parent.innerHTML = '';
  
  const container = document.createElement('div');
  container.className = `w-full h-full ${bgClass} flex items-center justify-center rounded-2xl`;
  
  const icon = document.createElement('div');
  icon.className = iconClass;
  icon.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>';
  
  container.appendChild(icon);
  parent.appendChild(container);
};

// PayPal Logo avec vraie image
export const PayPalLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PayPal_logo.svg/200px-PayPal_logo.svg.png"
        alt="PayPal"
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          createSecureFallback(target.parentElement!, 'PayPal', 'text-blue-600');
        }}
      />
    </div>
  );
};

// Stripe Logo avec vraie image
export const StripeLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-purple-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Stripe_Logo%2C_revised_2016.svg/200px-Stripe_Logo%2C_revised_2016.svg.png"
        alt="Stripe"
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          createSecureFallback(target.parentElement!, 'Stripe', 'text-purple-600');
        }}
      />
    </div>
  );
};

// Moneroo Logo avec vraie image
export const MonerooLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-green-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://moneroo.com/logo.png"
        alt="Moneroo"
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          createSecureFallback(target.parentElement!, 'Moneroo', 'text-green-600');
        }}
      />
    </div>
  );
};

// VISA Card Logo
export const VisaLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-8',
    md: 'w-16 h-10',
    lg: 'w-20 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png"
        alt="VISA"
        className="w-full h-full object-contain p-1"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          createSecureFallback(target.parentElement!, 'VISA', 'text-white', 'Card');
        }}
      />
    </div>
  );
};

// Orange Money Logo
export const OrangeMoneyLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-orange-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/200px-Orange_logo.svg.png"
        alt="Orange Money"
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          createSecureFallback(target.parentElement!, 'OM', 'text-orange-600', 'Orange');
        }}
      />
    </div>
  );
};

// MTN Mobile Money Logo
export const MTNMobileMoneyLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-yellow-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/MTN_Group_logo.svg/200px-MTN_Group_logo.svg.png"
        alt="MTN Mobile Money"
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          createSecureFallback(target.parentElement!, 'MTN', 'text-yellow-600', 'MoMo');
        }}
      />
    </div>
  );
};

// Moov Money Logo
export const MoovMoneyLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Moov_Africa_logo.svg/200px-Moov_Africa_logo.svg.png"
        alt="Moov Money"
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          createSecureFallback(target.parentElement!, 'MOOV', 'text-blue-600', 'Money');
        }}
      />
    </div>
  );
};

// Wave Logo
export const WaveLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white border border-purple-200 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://wave.com/logo.png"
        alt="Wave"
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          createSecureFallback(target.parentElement!, 'Wave', 'text-purple-600');
        }}
      />
    </div>
  );
};

// Bitcoin Logo avec icône
export const BitcoinLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <Bitcoin className={`${iconSizes[size]} text-white`} />
    </div>
  );
};

// Mastercard Logo
export const MastercardLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-8',
    md: 'w-16 h-10',
    lg: 'w-20 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png"
        alt="Mastercard"
        className="w-full h-full object-contain p-1"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          createSecureFallback(target.parentElement!, 'MC', 'text-white', 'Card');
        }}
      />
    </div>
  );
};

// Bank Transfer Logo
export const BankTransferLogo = ({ size = 'md', className = '' }: PaymentLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      <Building className={`${iconSizes[size]} text-white`} />
    </div>
  );
};

// Export de tous les logos
export const PaymentLogos = {
  PayPal: PayPalLogo,
  Stripe: StripeLogo,
  Moneroo: MonerooLogo,
  Visa: VisaLogo,
  OrangeMoney: OrangeMoneyLogo,
  MTNMobileMoney: MTNMobileMoneyLogo,
  MoovMoney: MoovMoneyLogo,
  Wave: WaveLogo,
  Bitcoin: BitcoinLogo,
  Mastercard: MastercardLogo,
  BankTransfer: BankTransferLogo,
};
