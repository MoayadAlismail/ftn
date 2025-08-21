"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import {
  CreditCard,
  ShieldCheck,
  Receipt,
  Loader2,
  Check,
  X,
  Crown,
  Users,
  Mail,
  Calendar,
  Download,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  features: PlanFeature[];
  recommended?: boolean;
  current?: boolean;
}

const plans: BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    currency: 'SAR',
    interval: 'month',
    description: 'Perfect for small businesses starting their hiring journey',
    current: true,
    features: [
      { name: 'Candidate invites', included: true, limit: '10 per month' },
      { name: 'AI-powered search', included: true },
      { name: 'Resume downloads', included: true, limit: '20 per month' },
      { name: 'Saved candidates', included: true, limit: '50 profiles' },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: false },
      { name: 'Priority support', included: false },
      { name: 'Custom branding', included: false }
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    currency: 'SAR',
    interval: 'month',
    description: 'Ideal for growing companies with active hiring needs',
    recommended: true,
    features: [
      { name: 'Candidate invites', included: true, limit: '50 per month' },
      { name: 'AI-powered search', included: true },
      { name: 'Resume downloads', included: true, limit: 'Unlimited' },
      { name: 'Saved candidates', included: true, limit: '500 profiles' },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Priority support', included: true },
      { name: 'Custom branding', included: false }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 399,
    currency: 'SAR',
    interval: 'month',
    description: 'Comprehensive solution for large organizations',
    features: [
      { name: 'Candidate invites', included: true, limit: 'Unlimited' },
      { name: 'AI-powered search', included: true },
      { name: 'Resume downloads', included: true, limit: 'Unlimited' },
      { name: 'Saved candidates', included: true, limit: 'Unlimited' },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Priority support', included: true },
      { name: 'Custom branding', included: true }
    ]
  }
];

export default function BillingPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUsage, setCurrentUsage] = useState({
    invites: 7,
    downloads: 15,
    savedCandidates: 23
  });

  const currentPlan = plans.find(p => p.current) || plans[0];

  const handleUpgrade = (planId: string) => {
    toast.success(`Upgrade to ${plans.find(p => p.id === planId)?.name} plan initiated. This is a demo - no actual billing occurs.`);
  };

  const handleCancelPlan = () => {
    toast.success("Plan cancellation requested. This is a demo - no actual changes made.");
  };

  const handleUpdatePayment = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Payment method updated successfully. This is a demo.");
    }, 1500);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Downloading invoice ${invoiceId}. This is a demo.`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
        <p className="text-gray-600 mt-1">Manage your plan, usage, payment method, and invoices.</p>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <div>
                  <CardTitle className="text-xl">{currentPlan.name} Plan</CardTitle>
                  <p className="text-sm text-gray-600">{currentPlan.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-700 bg-green-50">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {currentPlan.currency} {currentPlan.price}
              </span>
              <span className="text-gray-500">per {currentPlan.interval}</span>
            </div>

            {/* Usage Metrics */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Current Usage</h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Candidate Invites</span>
                    <span>{currentUsage.invites}/10 used</span>
                  </div>
                  <Progress value={(currentUsage.invites / 10) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Resume Downloads</span>
                    <span>{currentUsage.downloads}/20 used</span>
                  </div>
                  <Progress value={(currentUsage.downloads / 20) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Saved Candidates</span>
                    <span>{currentUsage.savedCandidates}/50 used</span>
                  </div>
                  <Progress value={(currentUsage.savedCandidates / 50) * 100} className="h-2" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => handleUpgrade('professional')}>
                Upgrade Plan
              </Button>
              <Button variant="outline" onClick={handleCancelPlan}>
                Cancel Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Next Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold">Sep 15, 2024</p>
                <p className="text-sm text-gray-600">Auto-renewal in 12 days</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Starter Plan</span>
                  <span>SAR 49.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Tax (15%)</span>
                  <span>SAR 7.35</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>SAR 56.35</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 05/27</p>
              </div>
            </div>
            <Button
              variant="outline"
              disabled={isUpdating}
              onClick={handleUpdatePayment}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <p className="text-sm text-gray-600">Compare plans and upgrade anytime</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 ${plan.recommended ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'
                  } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    <Crown className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                )}
                {plan.current && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                    Current Plan
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.currency} {plan.price}</span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                          {feature.name}
                        </span>
                        {feature.limit && (
                          <span className="text-sm text-gray-500 block">
                            {feature.limit}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: '2024001', date: 'Aug 15, 2024', amount: 56.35, status: 'Paid' },
              { id: '2024002', date: 'Jul 15, 2024', amount: 56.35, status: 'Paid' },
              { id: '2024003', date: 'Jun 15, 2024', amount: 56.35, status: 'Paid' },
              { id: '2024004', date: 'May 15, 2024', amount: 56.35, status: 'Failed' }
            ].map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">Invoice #{invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={invoice.status === 'Paid' ? 'default' : 'destructive'}
                    className={invoice.status === 'Paid' ? 'bg-green-500' : ''}
                  >
                    {invoice.status}
                  </Badge>
                  <span className="font-medium">SAR {invoice.amount}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                    disabled={invoice.status === 'Failed'}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notice */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">Demo Notice</h4>
              <p className="text-sm text-amber-700 mt-1">
                This is a demonstration of the billing system. No actual payments are processed.
                In a production environment, this would integrate with payment processors like Stripe, PayPal, or local Saudi payment gateways.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



