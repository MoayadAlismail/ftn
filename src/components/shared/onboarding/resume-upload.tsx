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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeFile(e.target.files?.[0] || null);
    // Save the resume file to localStorage as a base64 string for retrieval after login
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function (event) {
        if (event.target && typeof event.target.result === "string") {
          // Save base64 string to localStorage
          localStorage.setItem("resumeFileBase64", event.target.result);
          // Optionally, save the file name for later use
          localStorage.setItem("resumeFileName", file.name);
        }
      };
      reader.readAsDataURL(file);
    }
    setUploadStatus("success");
  };

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div className="absolute top-6 right-6">
        <Button
          type="button"
          className="px-6 py-2 text-primary-foreground font-medium cursor-pointer"
          onClick={() => router.push("/employer/login")}
        >
دخول أصحاب العمل &larr;
        </Button>
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            مسيرتك المهنية المثالية <br />
            <span className="text-primary">تبدأ من هنا</span>
          </h1>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            ارفع سيرتك الذاتية ودع الذكاء الاصطناعي يجد لك الفرص المثالية
            <br />
           المناسبة لمهاراتك وطموحاتك.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
          <div
            className="border-2 border-dashed border-primary/20 rounded-lg flex flex-col items-center justify-center w-full py-8 cursor-pointer transition hover:border-primary/40"
            onClick={handleCardClick}
          >
            <div className="flex flex-col items-center mb-4">
              <div
                className="rounded-full p-4 shadow-md mb-4"
                style={{
                  backgroundColor:
                    uploadStatus === "success" ? "#22c55e" : "#2563eb",
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
                      <Check className="text-white w-8 h-8" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                ارفع سيرتك الذاتية
              </h2>
              <p className="text-gray-500 text-center mb-2">
                اسحب وأسقط ملف السيرة الذاتية هنا، أو انقر للتصفح
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
                    className="mt-2 px-6 py-2 text-base font-medium cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
اختر ملف &larr;
                  </Button>
                </>
              )}
              {uploadStatus === "success" && (
                <Button
                  type="button"
                  className="mt-2 px-6 py-2 text-base font-medium cursor-pointer"
                  onClick={next}
                >
التالي &larr;
                </Button>
              )}
              <p className="text-xs text-gray-400 mt-2">
تنسيق مدعوم: PDF (حد أقصى 10 ميجابايت)
              </p>
              {resumeFile && (
                <div>
                  <span className="text-xs text-center mx-auto text-green-600 mt-1">
تم اختيار:{" "}
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
موثوق من قبل طلاب&nbsp;
          <span className="text-gray-400 font-semibold">هارفارد</span>,&nbsp;
          <span className="text-gray-400 font-semibold">ستانفورد</span>,&nbsp;
          <span className="text-gray-400 font-semibold">MIT</span>,&nbsp;
          <span className="text-gray-400 font-semibold">بيركلي</span>
        </div>
      </div>
    </div>
  );
}
