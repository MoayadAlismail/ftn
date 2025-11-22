"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Check, Shield, Loader2 } from "lucide-react";
import { Service, QuestionnaireData, ScheduleData } from "../types";
import { format, parse } from "date-fns";

interface ServicePaymentProps {
  service: Service;
  questionnaire: QuestionnaireData;
  schedule: ScheduleData;
  onBack: () => void;
  onSuccess: () => void;
}

export default function ServicePayment({ 
  service,
  questionnaire,
  schedule,
  onBack, 
  onSuccess 
}: ServicePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handlePayment = async () => {
    // Basic validation
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      alert('Please fill in all payment details');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  // Parse the scheduled date
  const scheduledDate = parse(schedule.date, 'yyyy-MM-dd', new Date());

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schedule
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600">
            Secure payment powered by Stripe
          </p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Payment Form - 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                This is a mock payment form. No actual charges will be made.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Cardholder Name */}
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              {/* Card Number */}
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                    disabled={isProcessing}
                  />
                </div>

                {/* CVV */}
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    maxLength={3}
                    type="password"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Security Note */}
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900">
                  <p className="font-semibold mb-1">Your payment is secure</p>
                  <p className="text-green-700">
                    We use industry-standard encryption to protect your payment information.
                    Your card details are never stored on our servers.
                  </p>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay {service.price} SAR
                  </>
                )}
              </Button>

              {/* Mock Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Mock Payment:</strong> This is a placeholder payment form. 
                  When integrated with Stripe, real payments will be processed securely.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Summary - 1 column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-1"
        >
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Service Details */}
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">{service.icon}</div>
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.duration} minutes</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Booking Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Scheduled For</p>
                  <p className="font-medium">
                    {format(scheduledDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="font-medium">{schedule.time}</p>
                  <p className="text-xs text-gray-500 mt-1">{schedule.timezone}</p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Contact</p>
                  <p className="font-medium">{questionnaire.name}</p>
                  <p className="text-gray-600">{questionnaire.email}</p>
                </div>
              </div>

              <Separator />

              {/* What You'll Get */}
              <div>
                <p className="font-semibold mb-3 text-sm">What You&apos;ll Get:</p>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">{service.price} SAR</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{service.price} SAR</span>
                </div>
              </div>

              {/* One-time Payment Note */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 text-center">
                  One-time payment • No subscription • Cancel anytime before the session
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


