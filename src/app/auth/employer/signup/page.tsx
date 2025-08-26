"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoading } from "@/contexts/LoadingContext";
import { toast } from "sonner";
import { handleOAuthLogin, sendAuthOTP, verifyAuthOTP, getRedirectUrl } from "@/lib/auth-utils";
import { OtpVerification } from "@/components/auth/otp-verification";
import { Role } from "@/constants/enums";
import { ArrowLeft, Building2 } from "lucide-react";
import { GoogleIcon, LinkedInIcon } from "@/components/ui/social-icons";
import Link from "next/link";

export default function EmployerSignup() {
    const router = useRouter();
    const { startLoading, stopLoading } = useLoading();
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        companyName: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.email || !formData.fullName || !formData.companyName) {
            toast.error("Please fill in all fields");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }

        return true;
    };

    const handleEmailSignup = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        startLoading();

        try {
            const { success, error, needsVerification } = await sendAuthOTP(formData.email);

            if (error) {
                toast.error(`Signup failed: ${error}`);
                return;
            }

            if (success && needsVerification) {
                setOtpSent(true);
                toast.success("Please check your email for the verification code");
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
            stopLoading();
        }
    };

    const handleOTPVerification = async (otpValue: string) => {
        setIsLoading(true);
        startLoading();

        try {
            const { success, error, user } = await verifyAuthOTP(
                formData.email, 
                otpValue, 
                Role.EMPLOYER,
                {
                    fullName: formData.fullName,
                    companyName: formData.companyName
                }
            );

            if (error) {
                toast.error(`Verification failed: ${error}`);
                return;
            }

            if (success && user) {
                const redirectUrl = getRedirectUrl(user);
                toast.success("Account created successfully!");
                router.push(redirectUrl);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
            stopLoading();
        }
    };

    const handleResendOtp = async () => {
        const { success, error } = await sendAuthOTP(formData.email);
        if (error) {
            toast.error("Failed to resend code: " + error);
            throw new Error(error);
        }
    };

    const handleBackToSignup = () => {
        setOtpSent(false);
    };

    const handleSocialLogin = async (provider: 'google' | 'linkedin_oidc') => {
        startLoading();

        const { success, error } = await handleOAuthLogin(
            provider,
            Role.EMPLOYER,
            `${window.location.origin}/auth/callback?role=employer`
        );

        if (!success) {
            toast.error(error || `${provider} login failed`);
            stopLoading();
        }
        // Success case is handled by OAuth redirect
    };

    if (otpSent) {
        return (
            <OtpVerification
                email={formData.email}
                onVerify={handleOTPVerification}
                onResend={handleResendOtp}
                onBack={handleBackToSignup}
                isLoading={isLoading}
                title="Verify Your Email"
                description="We sent a verification code to complete your registration"
            />
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-cyan-400/20 to-blue-400/20" />

            <div className="grid lg:grid-cols-2 min-h-screen relative z-10">
                {/* Left Column - Signup Form */}
                <div className="flex flex-col justify-center px-8 py-12 lg:px-16 bg-white/80 backdrop-blur-sm">
                    <div className="mx-auto w-full max-w-sm">
                        {/* Header with back button */}
                        <div className="flex items-center mb-8">
                            <Link href="/" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft size={20} />
                            </Link>
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg mr-3 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white rounded-sm" />
                                </div>
                                <span className="text-xl font-semibold text-gray-900">FTN</span>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                Create Employer Account
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Connect with top talent and build your dream team
                            </p>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="space-y-3 mb-6">
                            <Button
                                variant="outline"
                                className="w-full h-12 text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                                onClick={() => handleSocialLogin('google')}
                                disabled={isLoading}
                            >
                                <GoogleIcon className="mr-3" />
                                Continue with Google
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full h-12 text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                                onClick={() => handleSocialLogin('linkedin_oidc')}
                                disabled={isLoading}
                            >
                                <LinkedInIcon className="mr-3" />
                                Continue with LinkedIn
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-500">or sign up with email</span>
                            </div>
                        </div>

                        {/* Signup Form */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    placeholder="Enter your company name"
                                    className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Work Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your work email"
                                    className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                            </div>


                            {/* Sign Up Button */}
                            <Button
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                onClick={handleEmailSignup}
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending code..." : "Send verification code"}
                            </Button>

                            {/* Footer Links */}
                            <div className="text-center mt-6 space-y-2">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{" "}
                                    <Link href="/auth/employer/login" className="text-emerald-600 underline font-medium">
                                        Sign in
                                    </Link>
                                </p>
                                <p className="text-xs text-gray-500 mt-4">
                                    By creating an account, you agree to our{" "}
                                    <a href="#" className="underline hover:no-underline">Terms of Service</a>{" "}
                                    and{" "}
                                    <a href="#" className="underline hover:no-underline">Privacy Policy</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Gradient Background */}
                <div className="hidden lg:block relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500" />

                    {/* Floating notification */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-sm">
                            <div className="flex items-center mb-4">
                                <Building2 className="w-8 h-8 text-emerald-600 mr-3" />
                                <h3 className="font-semibold text-gray-800">Find Top Talent</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">
                                Access a curated pool of verified professionals ready to join your team.
                            </p>
                            <div className="flex items-center text-emerald-600 text-sm">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                Join 500+ companies hiring on FTN
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
