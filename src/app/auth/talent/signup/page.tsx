"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { useLoading } from "@/contexts/LoadingContext";
import { toast } from "sonner";
import { handleOAuthLogin } from "@/lib/auth-utils";
import { Role } from "@/constants/enums";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TalentSignup() {
    const router = useRouter();
    const { startLoading, stopLoading } = useLoading();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');

    // Check if resume data exists and is not expired
    const checkResumeData = () => {
        const resumeData = localStorage.getItem("resumeFileBase64");
        const resumeTimestamp = localStorage.getItem("resumeUploadTimestamp");

        if (!resumeData || !resumeTimestamp) {
            return false;
        }

        // Check if resume data is older than 1 hour (3600000 ms)
        const now = Date.now();
        const uploadTime = parseInt(resumeTimestamp);
        const isExpired = (now - uploadTime) > 3600000; // 1 hour expiry

        if (isExpired) {
            localStorage.removeItem("resumeFileBase64");
            localStorage.removeItem("resumeUploadTimestamp");
            return false;
        }

        return true;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
            toast.error("Please fill in all fields");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
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

        // Check if resume data exists
        if (!checkResumeData()) {
            toast.error("Resume data has expired. Please upload your resume again.");
            router.push("/");
            return;
        }

        setIsLoading(true);
        startLoading();

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        role: 'talent',
                        full_name: formData.fullName
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback?role=talent`
                }
            });

            if (error) {
                console.error("Signup error:", error.message);
                toast.error(`Signup failed: ${error.message}`);
                return;
            }

            if (data.user && !data.session) {
                // Email confirmation required
                setOtpSent(true);
                toast.success("Please check your email for the verification code");
            } else if (data.session) {
                // User signed up and automatically signed in
                await supabase.auth.updateUser({
                    data: { role: "talent" },
                });
                toast.success("Account created successfully!");
                router.push("/talent/onboarding");
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
            stopLoading();
        }
    };

    const handleOTPVerification = async () => {
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit verification code");
            return;
        }

        setIsLoading(true);
        startLoading();

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: otp,
                type: 'signup'
            });

            if (error) {
                console.error("OTP verification error:", error.message);
                toast.error(`Verification failed: ${error.message}`);
                return;
            }

            if (data.session) {
                await supabase.auth.updateUser({
                    data: { role: "talent" },
                });
                toast.success("Email verified successfully!");
                router.push("/talent/onboarding");
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
            stopLoading();
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'github' | 'linkedin_oidc') => {
        // Check if resume data exists
        if (!checkResumeData()) {
            toast.error("Resume data has expired. Please upload your resume again.");
            router.push("/");
            return;
        }

        startLoading();

        const { success, error } = await handleOAuthLogin(
            provider,
            Role.TALENT,
            `${window.location.origin}/auth/callback?role=talent`
        );

        if (!success) {
            toast.error(error || `${provider} login failed`);
            stopLoading();
        }
        // Success case is handled by OAuth redirect
    };

    if (otpSent) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-semibold">Verify Your Email</CardTitle>
                        <p className="text-muted-foreground">
                            We sent a verification code to <strong>{formData.email}</strong>
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-lg tracking-widest"
                                maxLength={6}
                            />
                        </div>

                        <Button
                            onClick={handleOTPVerification}
                            className="w-full"
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? "Verifying..." : "Verify Email"}
                        </Button>

                        <div className="text-center">
                            <button
                                onClick={() => setOtpSent(false)}
                                className="text-sm text-muted-foreground hover:text-foreground underline"
                            >
                                Back to signup
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20" />

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
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white rounded-sm" />
                                </div>
                                <span className="text-xl font-semibold text-gray-900">FTN</span>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                Create Your Account
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Join thousands of talents finding their dream opportunities
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
                                <svg width="18" height="18" viewBox="0 0 48 48" fill="none" className="mr-3">
                                    <g clipPath="url(#clip0_17_40)">
                                        <path d="M47.5 24.5C47.5 22.8333 47.3667 21.1667 47.1667 19.5H24V28.5H37.3333C36.8333 31.1667 35.1667 33.3333 32.8333 34.8333V40.1667H40.1667C44.1667 36.5 47.5 30.8333 47.5 24.5Z" fill="#4285F4" />
                                        <path d="M24 48C30.5 48 35.8333 45.8333 40.1667 40.1667L32.8333 34.8333C30.8333 36.1667 28.5 37 24 37C18.8333 37 14.3333 33.5 12.8333 28.8333H5.33331V34.3333C9.66665 42.1667 16.5 48 24 48Z" fill="#34A853" />
                                        <path d="M12.8333 28.8333C12.1667 27.1667 11.8333 25.3333 11.8333 23.5C11.8333 21.6667 12.1667 19.8333 12.8333 18.1667V12.6667H5.33331C3.16665 16.8333 2 21.1667 2 23.5C2 25.8333 3.16665 30.1667 5.33331 34.3333L12.8333 28.8333Z" fill="#FBBC05" />
                                        <path d="M24 10C28.5 10 31.5 11.8333 33.1667 13.3333L40.3333 6.16667C35.8333 2.16667 30.5 0 24 0C16.5 0 9.66665 5.83333 5.33331 12.6667L12.8333 18.1667C14.3333 13.5 18.8333 10 24 10Z" fill="#EA4335" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_17_40">
                                            <rect width="48" height="48" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                Continue with Google
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full h-12 text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                                onClick={() => handleSocialLogin('github')}
                                disabled={isLoading}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-3">
                                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                                Continue with GitHub
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
                                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Sign Up Button */}
                            <Button
                                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                                onClick={handleEmailSignup}
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </Button>

                            {/* Footer Links */}
                            <div className="text-center mt-6 space-y-2">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{" "}
                                    <Link href="/auth/talent/login" className="text-gray-900 underline font-medium">
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
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />

                    {/* Floating notification */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-sm">
                            <h3 className="font-semibold text-gray-800 mb-2">Ready to get started?</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Join thousands of professionals who have found their perfect opportunities through FTN.
                            </p>
                            <div className="flex items-center text-green-600 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Your resume is ready to go!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
