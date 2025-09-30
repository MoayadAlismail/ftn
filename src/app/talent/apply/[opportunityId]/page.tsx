"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    CreditCard,
    Check,
    Info,
    DollarSign,
    Calendar,
    Building2,
    MapPin,
    Percent,
    Gift,
    Shield,
    ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Opportunity } from "@/features/talent/opportunities/components/opportunity-card";

// Mock data - in real app, this would come from API
const MOCK_OPPORTUNITY: Opportunity = {
    id: "1",
    title: "Senior Frontend Developer",
    company_name: "TechCorp Saudi",
    location: "Riyadh",
    industry: "Technology",
    workstyle: "Hybrid",
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
    description: "We are looking for a Senior Frontend Developer to join our dynamic team.",
    created_at: "2024-01-15T10:00:00Z",
    matchScore: 92
};

interface DiscountCode {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    description: string;
    isValid: boolean;
}

const VALID_DISCOUNT_CODES: Record<string, DiscountCode> = {
    'TALENT20': {
        code: 'TALENT20',
        discount: 20,
        type: 'percentage',
        description: '20% off application fee',
        isValid: true
    },
    'NEWUSER': {
        code: 'NEWUSER',
        discount: 50,
        type: 'fixed',
        description: 'SAR 50 off for new users',
        isValid: true
    },
    'STUDENT': {
        code: 'STUDENT',
        discount: 50,
        type: 'percentage',
        description: '50% student discount',
        isValid: true
    }
};

export default function TalentApplicationPage() {
    const params = useParams();
    const router = useRouter();
    const opportunityId = params.opportunityId as string;

    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState<'application' | 'payment' | 'confirmation'>('application');

    // Application form data
    const [coverLetter, setCoverLetter] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [availability, setAvailability] = useState('');

    // Payment data
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'stc' | 'apple'>('card');

    // Pricing
    const baseApplicationFee = 99; // SAR
    const [finalPrice, setFinalPrice] = useState(baseApplicationFee);

    useEffect(() => {
        loadOpportunity();
    }, [opportunityId]);

    useEffect(() => {
        calculateFinalPrice();
    }, [appliedDiscount]);

    const loadOpportunity = async () => {
        setLoading(true);
        try {
            // In real app, fetch from API
            await new Promise(resolve => setTimeout(resolve, 500));
            setOpportunity(MOCK_OPPORTUNITY);
        } catch (error) {
            console.error('Error loading opportunity:', error);
            toast.error('Failed to load opportunity details');
        } finally {
            setLoading(false);
        }
    };

    const calculateFinalPrice = () => {
        if (!appliedDiscount) {
            setFinalPrice(baseApplicationFee);
            return;
        }

        let price = baseApplicationFee;
        if (appliedDiscount.type === 'percentage') {
            price = baseApplicationFee * (1 - appliedDiscount.discount / 100);
        } else {
            price = Math.max(0, baseApplicationFee - appliedDiscount.discount);
        }

        setFinalPrice(Math.round(price * 100) / 100);
    };

    const handleApplyDiscount = () => {
        const code = discountCode.toUpperCase().trim();
        if (!code) {
            toast.error('Please enter a discount code');
            return;
        }

        const discount = VALID_DISCOUNT_CODES[code];
        if (!discount || !discount.isValid) {
            toast.error('Invalid discount code');
            return;
        }

        setAppliedDiscount(discount);
        toast.success(`Discount applied: ${discount.description}`);
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        toast.success('Discount removed');
    };

    const handleSubmitApplication = async () => {
        if (!coverLetter.trim()) {
            toast.error('Please write a cover letter');
            return;
        }

        setProcessing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStep('payment');
        } catch (error) {
            toast.error('Failed to submit application');
        } finally {
            setProcessing(false);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // For demo, automatically schedule Calendly meeting
            setStep('confirmation');
            toast.success('Payment successful! Meeting scheduled.');
        } catch (error) {
            toast.error('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleScheduleCalendly = () => {
        // Open Calendly in a new window/tab
        const calendlyUrl = 'https://calendly.com/ftn-find/consultation';
        window.open(calendlyUrl, '_blank', 'width=800,height=700');

        // After a short delay, show success message
        setTimeout(() => {
            toast.success('Meeting scheduling opened! Please complete your booking.');
        }, 1000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Opportunity not found</h2>
                    <p className="text-gray-600 mt-2">The opportunity you're looking for doesn't exist.</p>
                    <Button onClick={() => router.back()} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-4 md:space-y-6">
            {/* Header - Mobile Optimized */}
            <div className="space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="w-fit">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Apply for Position</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        {opportunity.title} at {opportunity.company_name}
                    </p>
                </div>
            </div>

            {/* Progress Steps - Mobile Optimized */}
            <Card>
                <CardContent className="pt-4 md:pt-6">
                    {/* Mobile Layout - Stacked */}
                    <div className="block md:hidden space-y-4">
                        {[
                            { key: 'application', label: 'Application', icon: Info },
                            { key: 'payment', label: 'Payment', icon: CreditCard },
                            { key: 'confirmation', label: 'Confirmation', icon: Check }
                        ].map((stepItem, index) => {
                            const Icon = stepItem.icon;
                            const isActive = step === stepItem.key;
                            const isCompleted = ['application', 'payment', 'confirmation'].indexOf(step) > index;

                            return (
                                <div key={stepItem.key} className="flex items-center">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isCompleted ? 'bg-green-500 text-white' :
                                        isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className={`ml-3 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                        {stepItem.label}
                                    </span>
                                    {isActive && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            Current
                                        </span>
                                    )}
                                    {isCompleted && (
                                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                            ✓ Done
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Layout - Horizontal */}
                    <div className="hidden md:flex items-center justify-between">
                        {[
                            { key: 'application', label: 'Application', icon: Info },
                            { key: 'payment', label: 'Payment', icon: CreditCard },
                            { key: 'confirmation', label: 'Confirmation', icon: Check }
                        ].map((stepItem, index) => {
                            const Icon = stepItem.icon;
                            const isActive = step === stepItem.key;
                            const isCompleted = ['application', 'payment', 'confirmation'].indexOf(step) > index;

                            return (
                                <div key={stepItem.key} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isCompleted ? 'bg-green-500 text-white' :
                                        isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={`ml-3 font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                        {stepItem.label}
                                    </span>
                                    {index < 2 && (
                                        <div className={`mx-4 h-0.5 w-16 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                    {step === 'application' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 lg:space-y-6"
                        >
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg md:text-xl">Application Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="coverLetter" className="text-sm font-medium">Cover Letter *</Label>
                                        <Textarea
                                            id="coverLetter"
                                            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            className="min-h-[120px] md:min-h-[150px] mt-2 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="portfolio" className="text-sm font-medium">Portfolio/Website URL</Label>
                                        <Input
                                            id="portfolio"
                                            type="url"
                                            placeholder="https://yourportfolio.com"
                                            value={portfolioUrl}
                                            onChange={(e) => setPortfolioUrl(e.target.value)}
                                            className="mt-2 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="availability" className="text-sm font-medium">When can you start?</Label>
                                        <Input
                                            id="availability"
                                            placeholder="e.g., Immediately, 2 weeks notice, etc."
                                            value={availability}
                                            onChange={(e) => setAvailability(e.target.value)}
                                            className="mt-2 text-sm"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSubmitApplication}
                                        disabled={processing}
                                        className="w-full h-12"
                                        size="lg"
                                    >
                                        {processing ? 'Submitting...' : 'Continue to Payment'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {step === 'payment' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Discount Code Section */}
                                    <div className="space-y-4">
                                        <Label className="flex items-center gap-2">
                                            <Gift className="h-4 w-4" />
                                            Discount Code
                                        </Label>

                                        {appliedDiscount ? (
                                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium text-green-800">
                                                        {appliedDiscount.code} - {appliedDiscount.description}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemoveDiscount}
                                                    className="text-green-700 hover:text-green-800"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Enter discount code"
                                                    value={discountCode}
                                                    onChange={(e) => setDiscountCode(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={handleApplyDiscount}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                        )}

                                        <div className="text-xs md:text-sm text-gray-600">
                                            <p className="flex flex-wrap items-center gap-1">
                                                <Info className="h-3 w-3 flex-shrink-0" />
                                                <span>Try:</span>
                                                <span className="font-mono bg-gray-100 px-1 rounded text-xs">TALENT20</span>,
                                                <span className="font-mono bg-gray-100 px-1 rounded text-xs">NEWUSER</span>, or
                                                <span className="font-mono bg-gray-100 px-1 rounded text-xs">STUDENT</span>
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Payment Method Selection */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium">Payment Method</Label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { id: 'card', name: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, Mada' },
                                                { id: 'stc', name: 'STC Pay', icon: '📱', desc: 'Quick mobile payment' },
                                                { id: 'apple', name: 'Apple Pay', icon: '🍎', desc: 'Secure biometric payment' }
                                            ].map((method) => (
                                                <div
                                                    key={method.id}
                                                    className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === method.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    onClick={() => setPaymentMethod(method.id as 'card' | 'stc' | 'apple')}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{method.icon}</span>
                                                        <div>
                                                            <div className="font-medium">{method.name}</div>
                                                            <div className="text-sm text-gray-600">{method.desc}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Demo Notice */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-amber-800">Demo Mode</p>
                                                <p className="text-amber-700">
                                                    This is a demonstration. No actual payment will be processed.
                                                    Clicking "Pay Now" will simulate a successful payment and schedule a Calendly meeting.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handlePayment}
                                        disabled={processing}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="h-4 w-4 mr-2" />
                                                Pay SAR {finalPrice} Securely
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {step === 'confirmation' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 lg:space-y-6"
                        >
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <div className="mb-6">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                                            Application Submitted Successfully!
                                        </h2>
                                        <p className="text-sm md:text-base text-gray-600 px-4">
                                            Your application has been sent to {opportunity.company_name}.
                                            You'll receive updates via email.
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6 mb-6">
                                        <h3 className="text-base md:text-lg font-semibold text-blue-900 mb-2">
                                            Schedule Your Consultation
                                        </h3>
                                        <p className="text-sm md:text-base text-blue-800 mb-4">
                                            Book a free 30-minute consultation with our career experts to maximize your chances of success.
                                        </p>
                                        <Button
                                            onClick={handleScheduleCalendly}
                                            className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
                                            size="lg"
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Schedule Meeting
                                        </Button>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-3 justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('/talent/opportunities')}
                                            className="w-full md:w-auto"
                                        >
                                            Browse More Jobs
                                        </Button>
                                        <Button
                                            onClick={() => router.push('/talent/opportunities')}
                                            className="w-full md:w-auto"
                                        >
                                            View More Jobs
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4 lg:space-y-6">
                    {/* Opportunity Summary */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base md:text-lg">Position Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-base md:text-lg leading-tight">{opportunity.title}</h3>
                                <p className="text-sm md:text-base text-gray-600">{opportunity.company_name}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                                    <span>{opportunity.location} • {opportunity.workstyle}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <Building2 className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                                    <span>{opportunity.industry}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {opportunity.skills.slice(0, 4).map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>

                            {opportunity.matchScore && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2 md:p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs md:text-sm font-medium text-green-800">
                                            {opportunity.matchScore}% Match
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pricing Breakdown */}
                    {step === 'payment' && (
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base md:text-lg">Pricing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Application Fee</span>
                                    <span className="font-medium">SAR {baseApplicationFee}</span>
                                </div>

                                {appliedDiscount && (
                                    <div className="flex justify-between text-green-600 text-sm">
                                        <span className="flex items-center gap-1">
                                            <Percent className="h-3 w-3 flex-shrink-0" />
                                            {appliedDiscount.code}
                                        </span>
                                        <span className="font-medium">
                                            -{appliedDiscount.type === 'percentage'
                                                ? `${appliedDiscount.discount}%`
                                                : `SAR ${appliedDiscount.discount}`}
                                        </span>
                                    </div>
                                )}

                                <Separator />

                                <div className="flex justify-between font-semibold text-base md:text-lg">
                                    <span>Total</span>
                                    <span>SAR {finalPrice}</span>
                                </div>

                                <div className="text-xs text-gray-600 leading-relaxed">
                                    Includes consultation scheduling and career guidance
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Support */}
                    <Card>
                        <CardContent className="pt-4 md:pt-6">
                            <div className="text-center text-sm text-gray-600">
                                <p className="mb-2">Need help?</p>
                                <Button variant="link" className="text-sm p-0 h-auto text-blue-600 hover:text-blue-800">
                                    Contact Support
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
