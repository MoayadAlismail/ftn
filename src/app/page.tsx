"use client";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ResumeUpload from "@/components/shared/onboarding/resume-upload";
import TalentLogin from "@/components/shared/onboarding/talent-login";
import SelectOpportunities from "@/components/shared/onboarding/select-opportunities";
import SelectIndustries from "@/components/shared/onboarding/select-industries";
import LocationPreference from "@/components/shared/onboarding/location-preference";
import AboutYourself from "@/components/shared/onboarding/about-yourself";
// import Step3 from "@/components/onboarding/Step3";

function HomePageContent() {
  const searchParams = useSearchParams();
  const stepParam: string = searchParams.get("step") as string;
  let stepParamInt: number | null = null;
  if (stepParam) {
    console.warn(
      "The 'step' prop is deprecated. Use the 'step' state instead."
    );
    console.log(typeof stepParam, stepParam);
    stepParamInt = parseInt(stepParam as string, 10);
  } else {
    console.warn("The 'step' prop is not provided. Defaulting to step 1.");
  }

  const [step, setStep] = useState(stepParamInt ? stepParamInt : 1);
  const [bio, setBio] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [locationPreference, setLocationPreference] = useState("");
  const [industryPreference, setIndustryPreference] = useState<string[]>([]);
  const [workStylePreference, setWorkStylePreference] = useState<string[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const variants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ResumeUpload {...{ resumeFile, setResumeFile, next }} />;
      case 2:
        return <TalentLogin {...{ next }} />;
      case 3:
        return (
          <SelectOpportunities
            {...{
              setResumeFile,
              workStylePreference,
              setWorkStylePreference,
              next,
              prev,
            }}
          />
        );
      case 4:
        return (
          <SelectIndustries
            {...{ industryPreference, setIndustryPreference, next, prev }}
          />
        );
      case 5:
        return (
          <LocationPreference
            {...{ locationPreference, setLocationPreference, next, prev }}
          />
        );
      case 6:
        return (
          <AboutYourself
            {...{
              bio,
              setBio,
              resumeFile,
              workStylePreference,
              industryPreference,
              locationPreference,
              prev,
            }}
          />
        );
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-slate-50 text-slate-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
