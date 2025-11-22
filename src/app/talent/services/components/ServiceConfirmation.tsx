"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Calendar, Clock, Mail, Download, ArrowRight } from "lucide-react";
import { Service, QuestionnaireData, ScheduleData } from "../types";
import { format, parse } from "date-fns";

interface ServiceConfirmationProps {
  service: Service;
  questionnaire: QuestionnaireData;
  schedule: ScheduleData;
  onDone: () => void;
}

export default function ServiceConfirmation({ 
  service,
  questionnaire,
  schedule,
  onDone 
}: ServiceConfirmationProps) {
  const scheduledDate = parse(schedule.date, 'yyyy-MM-dd', new Date());

  const handleDownloadReceipt = () => {
    // Placeholder for receipt download
    alert('Receipt download functionality will be implemented with actual payment integration.');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Success Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your session has been successfully scheduled
          </p>
        </div>
      </motion.div>

      {/* Confirmation Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{service.icon}</div>
              <div>
                <CardTitle className="text-2xl">{service.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Booking Reference: #FTN-{Date.now().toString().slice(-8)}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold">
                    {format(scheduledDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="font-semibold">{schedule.time}</p>
                  <p className="text-xs text-gray-500">{schedule.timezone}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name</span>
                  <span className="text-sm font-medium">{questionnaire.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="text-sm font-medium">{questionnaire.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Role</span>
                  <span className="text-sm font-medium">{questionnaire.currentRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="text-sm font-medium">{questionnaire.yearsOfExperience}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Details */}
            <div>
              <h3 className="font-semibold mb-3">Payment Summary</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Service Fee</span>
                  <span className="font-medium">{service.price} SAR</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Paid</span>
                  <span className="text-xl font-bold text-green-700">{service.price} SAR</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* What Happens Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">1. Check Your Email</p>
                  <p className="text-sm text-gray-600">
                    We&apos;ve sent a confirmation email to <strong>{questionnaire.email}</strong> with 
                    all the details and a calendar invite.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">2. Prepare for Your Session</p>
                  <p className="text-sm text-gray-600">
                    Our expert will review your information beforehand to provide personalized guidance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">3. Join Your Session</p>
                  <p className="text-sm text-gray-600">
                    A meeting link will be sent 24 hours before your scheduled time.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Placeholder Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-900">
                <strong>Note:</strong> Email sending functionality is currently a placeholder. 
                When integrated, you&apos;ll receive automated confirmation and reminder emails.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={handleDownloadReceipt}
        >
          <Download className="h-5 w-5 mr-2" />
          Download Receipt
        </Button>
        
        <Button
          size="lg"
          className="flex-1"
          onClick={onDone}
        >
          Done
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </motion.div>

      {/* Support Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gray-50">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-600">
              Need to reschedule or have questions? Contact us at{' '}
              <a href="mailto:support@ftn.com" className="text-blue-600 hover:underline">
                support@ftn.com
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


