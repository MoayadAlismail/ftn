"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Briefcase, GraduationCap, Trophy, Target, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";
import OpportunitiesSection from "./opportunities-section";
import { ShineBorder } from "@/components/magicui/shine-border";

const FloatingCard = ({
  children,
  className = "",
  delay = 0,
  ...motionProps
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  [key: string]: unknown;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.6 }
    }}
    whileHover={{
      y: -8,
      transition: { duration: 0.2 }
    }}
    className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 ${className}`}
    {...motionProps}
  >
    {children}
  </motion.div>
);

const OpportunityCard = ({
  icon: Icon,
  title,
  company,
  match,
  className = "",
  delay = 0
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  company: string;
  match: string;
  className?: string;
  delay?: number;
}) => (
  <FloatingCard className={`w-64 ${className}`} delay={delay}>
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{title}</h3>
        <p className="text-xs text-gray-600 truncate">{company}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
            {match}
          </span>
        </div>
      </div>
    </div>
  </FloatingCard>
);

export default function HeroSection({ onGetStarted }: { onGetStarted: (skipResumeUpload?: boolean) => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [isDragging, setIsDragging] = useState(false);

  const processSelectedFile = (file: File | null) => {
    setResumeFile(file);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      if (event.target && typeof event.target.result === "string") {
        localStorage.setItem("resumeFileBase64", event.target.result);
        localStorage.setItem("resumeFileName", file.name);
        localStorage.setItem("resumeUploadTimestamp", Date.now().toString());
      }
    };
    reader.readAsDataURL(file);
    setUploadStatus("success");
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
    <div className="relative bg-gradient-to-br from-primary/5 via-white to-primary/10">
      {/* Hero Section */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] bg-gradient-radial from-primary/3 to-transparent rounded-full" />
        </div>

        {/* Top navigation */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 pointer-events-auto">
          <Link href="/auth/employer/login" prefetch={true}>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 backdrop-blur-sm border-white/40 hover:bg-white shadow-lg cursor-pointer relative pointer-events-auto text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">
                Recruiter? Login here{" "}
                <span aria-label="diagonal arrow" role="img" className="inline-block align-middle">
                  ↗
                </span>
              </span>
              <span className="sm:hidden">Recruiter </span>
            </Button>
          </Link>
        </div>

        {/* Student Login Button */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 pointer-events-auto">
          <Link href="/auth/talent/login" prefetch={true}>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white shadow-lg cursor-pointer relative pointer-events-auto text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Login</span>
              <span className="sm:hidden">Student</span>
            </Button>
          </Link>
        </div>

        {/* Floating opportunity cards - Hidden on mobile for cleaner design */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {/* Top left */}
          <OpportunityCard
            icon={Briefcase}
            title="Senior Software Engineer"
            company="TechCorp Inc."
            match="95% Match"
            className="absolute top-32 left-16 xl:left-20"
            delay={0.2}
          />

          {/* Top right */}
          <OpportunityCard
            icon={GraduationCap}
            title="Data Science Internship"
            company="AI Startup"
            match="89% Match"
            className="absolute top-40 right-20 xl:right-24"
            delay={0.4}
          />

          {/* Bottom left */}
          <OpportunityCard
            icon={Trophy}
            title="Product Design Bootcamp"
            company="Design Academy"
            match="92% Match"
            className="absolute bottom-40 left-20 xl:left-24"
            delay={0.6}
          />

          {/* Bottom right */}
          <OpportunityCard
            icon={Target}
            title="Blockchain Hackathon"
            company="CryptoLabs"
            match="87% Match"
            className="absolute bottom-32 right-16 xl:right-20"
            delay={0.8}
          />

          {/* Additional smaller cards for atmosphere - Only on larger screens */}
          <FloatingCard
            className="absolute top-60 left-1/4 w-48 opacity-60 hidden xl:block"
            delay={1.0}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-2 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="absolute bottom-60 right-1/4 w-48 opacity-60 hidden xl:block"
            delay={1.2}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-2 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
          </FloatingCard>
        </div>

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center max-w-4xl mx-auto mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
              Finally, career opportunities
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="text-primary">that deserve you.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Easily apply to jobs, internships, bootcamps, hackathons
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              that match your interests.
            </p>
          </motion.div>

          {/* Central upload action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative"
          >
            {/* Connection lines to floating cards */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ width: '200px', height: '200px', transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#944ADB" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#944ADB" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {/* Lines connecting to cards */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                d="M100,100 L50,50"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4,4"
              />
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 1.4 }}
                d="M100,100 L150,50"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4,4"
              />
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 1.6 }}
                d="M100,100 L50,150"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4,4"
              />
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 1.8 }}
                d="M100,100 L150,150"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4,4"
              />
            </svg>

            <div
              className={`relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${isDragging
                ? "border-primary bg-primary/5 scale-105"
                : uploadStatus === "success"
                  ? "border-green-400 bg-green-50/50"
                  : "border-white/30 hover:border-primary/50"
                } p-6 sm:p-8 text-center w-full max-w-md sm:max-w-lg mx-4`}
              onClick={handleCardClick}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Shine Border Effect */}
              <ShineBorder
                className="absolute inset-0 rounded-2xl"
                borderWidth={2}
                duration={8}
                shineColor={
                  isDragging
                    ? ["#944ADB", "#A855F7", "#944ADB"]
                    : uploadStatus === "success"
                      ? ["#10B981", "#34D399", "#10B981"]
                      : ["#E5E7EB", "#9CA3AF", "#E5E7EB"]
                }
              />

              {/* Upload Content - positioned above shine border */}
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <AnimatePresence mode="wait" initial={false}>
                    {uploadStatus !== "success" ? (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Upload size={24} className="text-primary sm:w-8 sm:h-8" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="check"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="bg-green-500 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center"
                      >
                        <Check size={24} className="text-white sm:w-8 sm:h-8" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  {uploadStatus === "success" ? "Resume Uploaded!" : "Upload your resume"}
                </h2>

                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  {uploadStatus === "success"
                    ? "Ready to find your perfect matches"
                    : isDragging
                      ? "Drop your PDF here"
                      : "Drag and drop your PDF here, or click to browse"
                  }
                </p>

                {resumeFile && uploadStatus === "success" && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-xs sm:text-sm text-green-700 font-medium">
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
                  <div className="space-y-2 sm:space-y-3">
                    <Button
                      size="default"
                      className="px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-medium w-full sm:w-auto"
                      onClick={handleCardClick}
                    >
                      Choose File →
                    </Button>
                    <p className="text-xs text-gray-500">
                      Supported format: PDF (max 10MB)
                    </p>
                  </div>
                ) : (
                  <Button
                    size="default"
                    className="px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-medium w-full sm:w-auto"
                    onClick={handleContinue}
                  >
                    Continue →
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Bottom trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-8 sm:mt-16 text-center px-4"
          >
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Trusted by students from</p>
            <div className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-8 text-xs sm:text-sm font-semibold text-gray-600 flex-wrap">
              <span>KFUPM</span>
              <span className="hidden sm:inline">King Saud University</span>
              <span className="sm:hidden">KSU</span>
              <span className="hidden sm:inline">King Abdulaziz University</span>
              <span className="sm:hidden">KAU</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Opportunities Section */}
      <OpportunitiesSection />
    </div>
  );
}