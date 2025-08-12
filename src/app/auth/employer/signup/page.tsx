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
import { Eye, EyeOff, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

export default function EmployerSignup() {
    const router = useRouter();
    const { startLoading, stopLoading } = useLoading();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        companyName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName || !formData.companyName) {
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

        setIsLoading(true);
        startLoading();

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        role: 'employer',
                        full_name: formData.fullName,
                        company_name: formData.companyName
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback?role=employer`
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
                    data: { role: "employer" },
                });
                toast.success("Account created successfully!");
                router.push("/employer/onboarding");
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
                    data: { role: "employer" },
                });
                toast.success("Email verified successfully!");
                router.push("/employer/onboarding");
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
            stopLoading();
        }
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
            <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
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
                                onClick={() => handleSocialLogin('linkedin_oidc')}
                                disabled={isLoading}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-3">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
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

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
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
                                        className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
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
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                onClick={handleEmailSignup}
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating Account..." : "Create Account"}
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
