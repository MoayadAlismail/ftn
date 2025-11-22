"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ServiceSelection from "./components/ServiceSelection";
import ServiceQuestionnaire from "./components/ServiceQuestionnaire";
import ServiceSchedule from "./components/ServiceSchedule";
import ServicePayment from "./components/ServicePayment";
import ServiceConfirmation from "./components/ServiceConfirmation";
import { Service, QuestionnaireData, ScheduleData, SERVICES } from "./types";
import LoadingAnimation from "@/components/loadingAnimation";

type FlowStep = 'selection' | 'questionnaire' | 'schedule' | 'payment' | 'confirmation';

function TalentServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<FlowStep>('selection');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);

  // Handle service preselection from URL
  useEffect(() => {
    const serviceId = searchParams.get('service');
    if (serviceId) {
      const service = SERVICES.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
        setCurrentStep('questionnaire');
      }
    }
  }, [searchParams]);

  // Step 1: Service Selection
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setCurrentStep('questionnaire');
  };

  // Step 2: Questionnaire
  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    setQuestionnaireData(data);
    setCurrentStep('schedule');
  };

  const handleQuestionnaireBack = () => {
    setCurrentStep('selection');
  };

  // Step 3: Schedule
  const handleScheduleSubmit = (data: ScheduleData) => {
    setScheduleData(data);
    setCurrentStep('payment');
  };

  const handleScheduleBack = () => {
    setCurrentStep('questionnaire');
  };

  // Step 4: Payment
  const handlePaymentSuccess = () => {
    setCurrentStep('confirmation');
  };

  const handlePaymentBack = () => {
    setCurrentStep('schedule');
  };

  // Step 5: Confirmation
  const handleDone = () => {
    // Reset the flow and go back to the main services page
    setCurrentStep('selection');
    setSelectedService(null);
    setQuestionnaireData(null);
    setScheduleData(null);
    
    // Optional: Navigate to dashboard or another page
    // router.push('/talent/dashboard');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Step 1: Service Selection */}
      {currentStep === 'selection' && (
        <ServiceSelection onSelectService={handleSelectService} />
      )}

      {/* Step 2: Questionnaire */}
      {currentStep === 'questionnaire' && selectedService && (
        <ServiceQuestionnaire
          service={selectedService}
          onBack={handleQuestionnaireBack}
          onContinue={handleQuestionnaireSubmit}
        />
      )}

      {/* Step 3: Schedule */}
      {currentStep === 'schedule' && selectedService && (
        <ServiceSchedule
          service={selectedService}
          onBack={handleScheduleBack}
          onContinue={handleScheduleSubmit}
        />
      )}

      {/* Step 4: Payment */}
      {currentStep === 'payment' && selectedService && questionnaireData && scheduleData && (
        <ServicePayment
          service={selectedService}
          questionnaire={questionnaireData}
          schedule={scheduleData}
          onBack={handlePaymentBack}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Step 5: Confirmation */}
      {currentStep === 'confirmation' && selectedService && questionnaireData && scheduleData && (
        <ServiceConfirmation
          service={selectedService}
          questionnaire={questionnaireData}
          schedule={scheduleData}
          onDone={handleDone}
        />
      )}
    </div>
  );
}

export default function TalentServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingAnimation size="lg" /></div>}>
      <TalentServicesContent />
    </Suspense>
  );
}
