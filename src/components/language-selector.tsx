"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe size={16} className="text-gray-600" />
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg border border-white/40 p-1">
        <Button
          variant={language === "en" ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage("en")}
          className={`h-7 px-3 text-xs font-medium ${
            language === "en" 
              ? "bg-primary text-white" 
              : "bg-transparent text-gray-600 hover:bg-gray-100"
          }`}
        >
          EN
        </Button>
        <Button
          variant={language === "ar" ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage("ar")}
          className={`h-7 px-3 text-xs font-medium ${
            language === "ar" 
              ? "bg-primary text-white" 
              : "bg-transparent text-gray-600 hover:bg-gray-100"
          }`}
        >
          ع
        </Button>
      </div>
    </div>
  );
}

