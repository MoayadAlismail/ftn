"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Check, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/lib/language/onboarding";

interface ResumeUploadStepProps {
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  next: () => void;
}

export default function ResumeUploadStep({
  resumeFile,
  setResumeFile,
  next,
}: ResumeUploadStepProps) {
  const { language } = useLanguage();
  const t = onboardingTranslations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [existingResumeName, setExistingResumeName] = useState<string | null>(null);
  const [existingResumeDate, setExistingResumeDate] = useState<string | null>(null);

  useEffect(() => {
    // Only run initialization once
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Check if resume exists in localStorage on mount
    const resumeData = localStorage.getItem("resumeFileBase64");
    const resumeFileName = localStorage.getItem("resumeFileName");
    const resumeTimestamp = localStorage.getItem("resumeUploadTimestamp");

    if (resumeData && resumeFileName && resumeTimestamp) {
      // Check if not expired (1 hour)
      const now = Date.now();
      const uploadTime = parseInt(resumeTimestamp);
      const isExpired = now - uploadTime > 3600000;

      if (!isExpired) {
        setExistingResumeName(resumeFileName);
        const date = new Date(uploadTime);
        setExistingResumeDate(date.toLocaleString());
        setUploadStatus("success");
        
        // Convert base64 to File
        try {
          const base64Response = resumeData.split(',')[1];
          const binaryString = window.atob(base64Response);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const file = new File([blob], resumeFileName, { type: 'application/pdf' });
          setResumeFile(file);
        } catch (error) {
          console.error("Error converting base64 to file:", error);
        }
      } else {
        // Clean up expired data
        localStorage.removeItem("resumeFileBase64");
        localStorage.removeItem("resumeFileName");
        localStorage.removeItem("resumeUploadTimestamp");
      }
    }
  }, [setResumeFile]);

  const processSelectedFile = (file: File | null) => {
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
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
        setExistingResumeName(file.name);
        setExistingResumeDate(new Date().toLocaleString());
        setUploadStatus("success");
        toast.success("Resume uploaded successfully");
      }
    };
    reader.onerror = function () {
      toast.error("Failed to read file. Please try again.");
      setUploadStatus("idle");
      setResumeFile(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    processSelectedFile(file);
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
    const file = e.dataTransfer.files?.[0] || null;
    processSelectedFile(file);
  };

  const handleReplaceResume = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setUploadStatus("idle");
    setExistingResumeName(null);
    setExistingResumeDate(null);
    localStorage.removeItem("resumeFileBase64");
    localStorage.removeItem("resumeFileName");
    localStorage.removeItem("resumeUploadTimestamp");
    toast.success("Resume removed");
  };

  const handleKeepResume = () => {
    next();
  };

  const handleSkip = () => {
    next();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
            <span>{t.stepOf} 1 {t.of} 5</span>
            <span>20% {t.complete}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-[20%] bg-primary rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 sm:space-y-5 text-center">
          {/* Icon */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <FileText size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">
              {t.uploadResumeTitle || "Upload Your Resume (Optional)"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {t.uploadResumeDescription || "Uploading your resume helps us match you better with opportunities"}
            </p>
          </div>

          {/* Upload area or existing resume display */}
          {uploadStatus !== "success" ? (
            <div
              className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center w-full py-8 sm:py-12 cursor-pointer transition ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-gray-300 hover:border-primary/50"
              }`}
              onClick={handleCardClick}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload size={24} className="text-primary sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    {isDragging ? "Drop your PDF here" : "Upload Resume"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Drag and drop or click to browse
                  </p>
                </div>
                <Input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Choose File
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Supported format: PDF (max 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="border-2 border-green-300 bg-green-50 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                      {existingResumeName || resumeFile?.name || "Resume Uploaded"}
                    </h3>
                    {existingResumeDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded: {existingResumeDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReplaceResume}
                  className="flex-1"
                >
                  <Upload size={16} className="mr-2" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveResume}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X size={16} className="mr-2" />
                  Remove
                </Button>
              </div>
              
              <Input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            className="cursor-pointer"
          >
            {t.skipForNow || "Skip for now"}
          </Button>
          <Button
            onClick={uploadStatus === "success" ? handleKeepResume : handleSkip}
            className="cursor-pointer"
          >
            {uploadStatus === "success" ? `${t.next || "Next"} →` : `${t.skip || "Skip"} →`}
          </Button>
        </div>
      </Card>
    </div>
  );
}

