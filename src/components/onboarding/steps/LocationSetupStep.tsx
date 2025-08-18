import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import type { SupportedCountry, CountryCurrency } from '@/types/onboarding';

interface LocationSetupStepProps {
  selectedCountry?: string;
  selectedCurrency?: string;
  onCountrySelect: (countryCode: string) => void;
  onCurrencySelect: (currencyCode: string) => void;
}

const LocationSetupStep: React.FC<LocationSetupStepProps> = ({
  selectedCountry,
  selectedCurrency,
  onCountrySelect,
  onCurrencySelect,
}) => {
  const { countries, currencies, getCurrenciesForCountry } = useOnboarding();
  const [availableCurrencies, setAvailableCurrencies] = useState<CountryCurrency[]>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Charger les devises disponibles quand le pays change
  useEffect(() => {
    if (selectedCountry) {
      loadCurrenciesForCountry(selectedCountry);
    }
  }, [selectedCountry]);

  const loadCurrenciesForCountry = async (countryCode: string) => {
    const currencies = await getCurrenciesForCountry(countryCode);
    setAvailableCurrencies(currencies);
    
    // Sélectionner automatiquement la devise principale si aucune devise n'est sélectionnée
    if (!selectedCurrency) {
      const primaryCurrency = currencies.find(c => c.is_primary);
      if (primaryCurrency) {
        onCurrencySelect(primaryCurrency.currency_code);
      }
    }
  };

  const selectedCountryData = countries?.find(c => c.code === selectedCountry);
  const selectedCurrencyData = currencies?.find(c => c.code === selectedCurrency);

  const handleCountrySelect = (countryCode: string) => {
    onCountrySelect(countryCode);
    setShowCountryDropdown(false);
  };

  const handleCurrencySelect = (currencyCode: string) => {
    onCurrencySelect(currencyCode);
    setShowCurrencyDropdown(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Configurons l'emplacement et la devise par défaut de votre boutique. Ne vous inquiétez pas - vos clients peuvent payer de n'importe où !
        </p>
      </div>

      {/* Sélection du pays */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Votre emplacement
        </label>
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between h-12 text-left"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          >
            <div className="flex items-center gap-3">
              {selectedCountryData ? (
                <>
                  <span className="text-lg">{selectedCountryData.flag_emoji}</span>
                  <span>{selectedCountryData.name}</span>
                </>
              ) : (
                <span className="text-gray-500">Sélectionnez votre pays</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showCountryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {countries?.map((country) => (
                <button
                  key={country.code}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                  onClick={() => handleCountrySelect(country.code)}
                >
                  <span className="text-lg">{country.flag_emoji}</span>
                  <span>{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sélection de la devise */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Devise principale de la boutique
        </label>
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between h-12 text-left"
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            disabled={!selectedCountry}
          >
            <div className="flex items-center gap-3">
              {selectedCurrencyData ? (
                <>
                  <span className="text-lg">💰</span>
                  <span>{selectedCurrencyData.name} ({selectedCurrencyData.symbol})</span>
                </>
              ) : (
                <span className="text-gray-500">
                  {selectedCountry ? 'Sélectionnez votre devise' : 'Sélectionnez d\'abord votre pays'}
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showCurrencyDropdown && selectedCountry && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {availableCurrencies.map((countryCurrency) => {
                const currency = currencies?.find(c => c.code === countryCurrency.currency_code);
                if (!currency) return null;

                return (
                  <button
                    key={countryCurrency.currency_code}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => handleCurrencySelect(countryCurrency.currency_code)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">💰</span>
                      <span>{currency.name} ({currency.symbol})</span>
                    </div>
                    {countryCurrency.is_primary && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Principal
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Conseils</p>
              <p>
                Définissez votre devise principale pour la tarification, et nous gérerons les conversions automatiques. 
                Vos clients peuvent payer dans leur devise locale, peu importe où ils se trouvent. 
                Vous recevrez les paiements dans la devise de votre boutique.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationSetupStep;
