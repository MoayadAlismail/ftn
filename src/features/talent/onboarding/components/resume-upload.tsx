import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { Upload, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface ResumeUploadProps {
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  next: () => void;
}

export default function ResumeUpload({
  resumeFile,
  setResumeFile,
  next,
}: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  // Add state for upload status
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success"
  >("idle");
  const [isDragging, setIsDragging] = useState(false);

  const processSelectedFile = (file: File | null) => {
    setResumeFile(file);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      if (event.target && typeof event.target.result === "string") {
        localStorage.setItem("resumeFileBase64", event.target.result);
        localStorage.setItem("resumeFileName", file.name);
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
    fileInputRef.current?.click();
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

  return (
    <div>
      <div className="absolute top-6 right-6">
        <Button
          type="button"
          className="px-6 py-2 text-primary-foreground font-medium cursor-pointer"
          onClick={() => { router.replace("/auth/employer/login"); console.log("button login clicked") }}
        >
          Recruiter Login &rarr;
        </Button>
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Your Dream Career <br />
            <span className="text-primary">Starts Here</span>
          </h1>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Upload your resume and let our AI match you with the perfect
            opportunities
            <br />
            tailored to your skills and aspirations.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
          <div
            className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center w-full py-8 cursor-pointer transition ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
              `}
            onClick={handleCardClick}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center mb-4">
              <div
                className="rounded-full p-4 shadow-md mb-4 bg-"
                style={{
                  backgroundColor:
                    uploadStatus === "success" ? "#22c55e" : "#944ADB",
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {uploadStatus !== "success" ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Upload className="text-white w-8 h-8" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="check"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check color="white" className="text-white w-8 h-8" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Upload Your Resume
              </h2>
              <p className="text-gray-500 text-center mb-2">
                Drag and drop your PDF resume here, or click to browse
              </p>
              {uploadStatus !== "success" && (
                <>
                  <Input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    className="mt-2 px-6 py-2 text-white font-medium cursor-pointer bg-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Choose File &rarr;
                  </Button>
                </>
              )}
              {uploadStatus === "success" && (
                <Button
                  type="button"
                  className="mt-2 px-6 py-2 text-base font-medium cursor-pointer"
                  onClick={next}
                >
                  Next &rarr;
                </Button>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Supported format: PDF (max 10MB)
              </p>
              {resumeFile && (
                <div>
                  <span className="text-xs text-center mx-auto text-green-600 mt-1">
                    Selected:{" "}
                    {resumeFile.name.length > 50
                      ? resumeFile.name.slice(0, 47) + "... "
                      : resumeFile.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 w-full flex justify-center text-xs text-gray-400">
          Trusted by students from&nbsp;
          <span className="text-gray-400 font-semibold">Harvard</span>,&nbsp;
          <span className="text-gray-400 font-semibold">Stanford</span>,&nbsp;
          <span className="text-gray-400 font-semibold">MIT</span>,&nbsp;
          <span className="text-gray-400 font-semibold">Berkeley</span>
        </div>
      </div>
    </div>
  );
}
