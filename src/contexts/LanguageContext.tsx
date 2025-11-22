"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isRTL, setIsRTL] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount and sync with HTML attributes
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    const langToUse = (savedLanguage === "ar" || savedLanguage === "en") ? savedLanguage : "en";
    
    setLanguageState(langToUse);
    setIsRTL(langToUse === "ar");
    setMounted(true);
    
    // Ensure document direction is set correctly (sync with inline script)
    if (typeof document !== "undefined") {
      document.documentElement.dir = langToUse === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = langToUse;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setIsRTL(lang === "ar");
    localStorage.setItem("language", lang);
    
    // Update document direction
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

