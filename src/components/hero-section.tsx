"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Check } from "lucide-react";
import { useRef, useState } from "react";
import OpportunitiesSection from "./opportunities-section";
import { useLanguage } from "@/contexts/LanguageContext";
import { homeTranslations } from "@/lib/language/home";
import { toast } from "sonner";

export default function HeroSection({ onGetStarted }: { onGetStarted: (skipResumeUpload?: boolean) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const t = homeTranslations[language];

  // Resume upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [isDragging, setIsDragging] = useState(false);

  const processSelectedFile = (file: File | null) => {
    if (!file) return;
    
    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error(t.pdfOnly);
      return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t.fileSizeLimit);
      return;
    }
    
    setResumeFile(file);
    setUploadStatus("uploading");
    
    const reader = new FileReader();
    reader.onload = function (event) {
      if (event.target && typeof event.target.result === "string") {
        localStorage.setItem("resumeFileBase64", event.target.result);
        localStorage.setItem("resumeFileName", file.name);
        localStorage.setItem("resumeUploadTimestamp", Date.now().toString());
        setUploadStatus("success");
      }
    };
    reader.onerror = function () {
      toast.error(t.fileReadError);
      setUploadStatus("idle");
      setResumeFile(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    processSelectedFile(file);
    // Allow selecting the same file again later
    e.target.value = "";
  };

  const handleCardClick = () => {
    if (uploadStatus !== "success") {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0] ? e.dataTransfer.files[0] : null;
    processSelectedFile(file);
  };

  const handleContinue = () => {
    if (uploadStatus === "success") {
      // Skip resume upload step since it's already done in hero
      onGetStarted(true);
    }
  };

  return (
    <div className="relative bg-white">
      {/* Hero Section */}
      <div className="min-h-screen relative">
        {/* Main content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t.heroTitle1}
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="text-primary">{t.heroTitle2}</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t.heroSubtitle1}
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              {t.heroSubtitle2}
            </p>
          </div>

          {/* Central upload action */}
          <div className="relative w-full max-w-md mx-4 sm:mx-6">
            <div
              className={`relative bg-white rounded-lg border-2 border-dashed p-8 text-center ${isDragging
                ? "border-primary bg-gray-50"
                : uploadStatus === "success"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
                } cursor-pointer`}
              onClick={handleCardClick}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                {uploadStatus !== "success" ? (
                  <Upload size={32} className="text-gray-600" />
                ) : (
                  <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center">
                    <Check size={32} className="text-white" />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {uploadStatus === "success" ? t.resumeUploaded : t.uploadResume}
              </h2>

              <p className="text-sm text-gray-600 mb-6">
                {uploadStatus === "success"
                  ? t.readyToMatch
                  : isDragging
                    ? t.dropPdfHere
                    : t.dragDropText
                }
              </p>

              {resumeFile && uploadStatus === "success" && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm text-green-700 font-medium">
                    📄 {resumeFile.name.length > 30
                      ? resumeFile.name.slice(0, 27) + "..."
                      : resumeFile.name}
                  </span>
                </div>
              )}

              <Input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {uploadStatus !== "success" ? (
                <div className="space-y-3">
                  <Button
                    size="default"
                    className="px-8 py-3 w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick();
                    }}
                  >
                    {t.chooseFile}
                  </Button>
                  <p className="text-xs text-gray-500">
                    {t.supportedFormat}
                  </p>
                </div>
              ) : (
                <Button
                  size="default"
                  className="px-8 py-3 w-full sm:w-auto"
                  onClick={handleContinue}
                >
                  {t.continue}
                </Button>
              )}
            </div>
          </div>

          {/* Bottom trust indicators */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 mb-4">{t.trustedBy}</p>
            <div className="flex items-center justify-center gap-6 lg:gap-8 text-sm font-semibold text-gray-600 flex-wrap">
              <span>{t.kfupm}</span>
              <span className="hidden sm:inline">{t.ksu}</span>
              <span className="sm:hidden">{t.ksuMobile}</span>
              <span className="hidden sm:inline">{t.kau}</span>
              <span className="sm:hidden">{t.kauMobile}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Section */}
      <OpportunitiesSection />
    </div>
  );
}
