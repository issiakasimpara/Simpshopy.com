import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ONBOARDING_STEPS } from '@/types/onboarding';
import ExperienceLevelStep from './steps/ExperienceLevelStep';
import BusinessTypeStep from './steps/BusinessTypeStep';
import LocationSetupStep from './steps/LocationSetupStep';
import AppLogo from '@/components/ui/AppLogo';

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    onboardingData,
    isOnboardingCompleted,
    shouldShowOnboarding,
    isLoading,
    isSaving,
    isCompleting,
    saveStep,
    goToPreviousStep,
    completeOnboarding,
  } = useOnboarding();

  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState(onboardingData.experience_level);
  const [selectedBusinessType, setSelectedBusinessType] = useState(onboardingData.business_type);
  const [selectedCountry, setSelectedCountry] = useState(onboardingData.country_code);
  const [selectedCurrency, setSelectedCurrency] = useState(onboardingData.currency_code);

  // Rediriger si l'onboarding est déjà terminé
  useEffect(() => {
    if (isOnboardingCompleted) {
      navigate('/dashboard');
    }
  }, [isOnboardingCompleted, navigate]);

  // Rediriger si l'utilisateur n'est pas connecté
  if (!shouldShowOnboarding) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre configuration...</p>
        </div>
      </div>
    );
  }

  const handleNext = async () => {
    if (currentStep === 1 && selectedExperienceLevel) {
      await saveStep({ experience_level: selectedExperienceLevel });
    } else if (currentStep === 2 && selectedBusinessType) {
      await saveStep({ business_type: selectedBusinessType });
    } else if (currentStep === 3 && selectedCountry && selectedCurrency) {
      await saveStep({ 
        country_code: selectedCountry, 
        currency_code: selectedCurrency 
      });
      await completeOnboarding();
      navigate('/dashboard');
    }
  };

  const handlePrevious = async () => {
    await goToPreviousStep();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedExperienceLevel;
      case 2:
        return !!selectedBusinessType;
      case 3:
        return !!selectedCountry && !!selectedCurrency;
      default:
        return false;
    }
  };

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ExperienceLevelStep
            selectedLevel={selectedExperienceLevel}
            onSelect={setSelectedExperienceLevel}
          />
        );
      case 2:
        return (
          <BusinessTypeStep
            selectedType={selectedBusinessType}
            onSelect={setSelectedBusinessType}
          />
        );
      case 3:
        return (
          <LocationSetupStep
            selectedCountry={selectedCountry}
            selectedCurrency={selectedCurrency}
            onCountrySelect={setSelectedCountry}
            onCurrencySelect={setSelectedCurrency}
          />
        );
      default:
        return null;
    }
  };

  const currentStepConfig = ONBOARDING_STEPS.find(step => step.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppLogo />
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Preview
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              {ONBOARDING_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-1 w-8 rounded-full transition-colors ${
                    step.id <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            {/* Step Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentStepConfig?.title}
              </h1>
              <p className="text-gray-600">
                {currentStepConfig?.description}
              </p>
            </div>

            {/* Step Content */}
            <div className="mb-8">
              {getCurrentStepComponent()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSaving || isCompleting}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>

              <div className="flex items-center gap-2">
                {currentStep === 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || isSaving || isCompleting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isCompleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Finalisation...
                      </>
                    ) : (
                      <>
                        Ouvrir votre boutique
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        Continuer
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OnboardingWizard;
