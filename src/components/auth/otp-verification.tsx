"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OtpVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  onBack?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  resendCooldown?: number; // seconds
}

export function OtpVerification({
  email,
  onVerify,
  onResend,
  onBack,
  isLoading = false,
  title = "Verify Your Email",
  description,
  resendCooldown = 60,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === "Enter" && otp.every(digit => digit !== "")) {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (digits.length > 0) {
      const newOtp = ["", "", "", "", "", ""];
      for (let i = 0; i < digits.length && i < 6; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a complete 6-digit verification code");
      return;
    }

    try {
      await onVerify(otpValue);
    } catch (error) {
      // Error handling is done in parent component
      console.error("OTP verification error:", error);
    }
  };

  const handleResend = async () => {
    if (!onResend || resendTimer > 0) return;

    setIsResending(true);
    try {
      await onResend();
      setResendTimer(resendCooldown);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success("Verification code sent!");
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every(digit => digit !== "");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-6">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-4 p-2"
                onClick={onBack}
                disabled={isLoading}
              >
                <ArrowLeft size={18} />
              </Button>
            )}
            
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {title}
            </CardTitle>
            
            <p className="text-gray-600 mt-2">
              {description || (
                <>
                  We sent a verification code to{" "}
                  <span className="font-medium text-gray-900">{email}</span>
                </>
              )}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Enter 6-digit verification code
              </label>
              
              <div className="flex justify-center space-x-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    // ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={cn(
                      "w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      "transition-all duration-200",
                      digit ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isLoading}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium"
              disabled={!isComplete || isLoading}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </motion.div>
                ) : (
                  <motion.span
                    key="verify"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Verify Email
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Resend Section */}
            {onResend && (
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Didn't receive the code?</p>
                
                {resendTimer > 0 ? (
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Resend in {resendTimer}s
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    disabled={isResending || isLoading}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    {isResending ? "Sending..." : "Resend code"}
                  </Button>
                )}
              </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
              <p>💡 <strong>Tip:</strong> You can paste the entire code at once</p>
              <p className="mt-1">Check your spam folder if you don't see the email</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}