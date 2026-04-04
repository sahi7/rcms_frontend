import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../landing/components/Header';
import { Footer } from '../landing/components/Footer';
import { useOnboardingStore } from '@/app/store/onboardingStore';
import { usePlansAndFeatures } from '@/hooks/shared/usePlansAndFeatures';
import Step1SchoolInfo from './components/Step1SchoolInfo';
import Step2AdminSetup from './components/Step2AdminSetup';
import Step3Subscription from './components/Step3Subscription';
import Step4Review from './components/Step4Review';

const steps = [
  { id: 1, title: 'School Information' },
  { id: 2, title: 'Admin Account' },
  { id: 3, title: 'Choose Plan' },
  { id: 4, title: 'Review & Submit' },
];

export default function OnboardingPage() {
  const { data, setStep } = useOnboardingStore();
  const { plans, features, isLoading } = usePlansAndFeatures();
  const [currentStep, setCurrentStep] = useState(data.currentStep);

  const goNext = () => {
    const next = Math.min(currentStep + 1, steps.length);
    setCurrentStep(next);
    setStep(next);
  };

  const goBack = () => {
    const prev = Math.max(currentStep - 1, 1);
    setCurrentStep(prev);
    setStep(prev);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading plans...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Stepper */}
          <div className="mb-12">
            <div className="flex justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 transition-all"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step.id < currentStep
                        ? 'bg-orange-500 text-white'
                        : step.id === currentStep
                        ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}
                  >
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  <span className="text-xs mt-2 font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-10"
          >
            {currentStep === 1 && <Step1SchoolInfo onNext={goNext} />}
            {currentStep === 2 && <Step2AdminSetup onNext={goNext} onBack={goBack} />}
            {currentStep === 3 && <Step3Subscription onNext={goNext} onBack={goBack} plans={plans} features={features} />}
            {currentStep === 4 && <Step4Review onBack={goBack} />}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}