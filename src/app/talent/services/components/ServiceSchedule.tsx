"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Service, ScheduleData } from "../types";
import { format } from "date-fns";

interface ServiceScheduleProps {
  service: Service;
  onBack: () => void;
  onContinue: (data: ScheduleData) => void;
}

// Available time slots (example data)
const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

const TIMEZONES = [
  'Asia/Riyadh (GMT+3)',
  'Asia/Dubai (GMT+4)',
  'Europe/London (GMT+0)',
  'America/New_York (GMT-5)',
];

export default function ServiceSchedule({ 
  service, 
  onBack, 
  onContinue 
}: ServiceScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTimezone, setSelectedTimezone] = useState<string>('Asia/Riyadh (GMT+3)');
  const [error, setError] = useState<string>('');

  const handleContinue = () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }
    if (!selectedTime) {
      setError('Please select a time slot');
      return;
    }

    onContinue({
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      timezone: selectedTimezone,
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (error) setError('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (error) setError('');
  };

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
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questionnaire
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Your Session</h1>
          <p className="text-gray-600">
            Choose a date and time that works best for you
          </p>
        </div>
      </motion.div>

      {/* Service Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{service.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration} minutes</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {service.price} SAR
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Scheduling Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date and Time
            </CardTitle>
            <CardDescription>
              All times are shown in your selected timezone
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Timezone Selector */}
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <div className="border rounded-lg p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      // Disable past dates and dates more than 60 days in the future
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const maxDate = new Date();
                      maxDate.setDate(maxDate.getDate() + 60);
                      return date < today || date > maxDate;
                    }}
                    className="rounded-md"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <Label>Select Time</Label>
                <div className="border rounded-lg p-4 max-h-[350px] overflow-y-auto">
                  {!selectedDate ? (
                    <div className="text-center text-sm text-gray-500 py-8">
                      Please select a date first
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`px-4 py-3 text-sm rounded-lg border transition-[border-color,background-color,color] duration-75 ${
                            selectedTime === time
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cal.com Integration Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This is a placeholder calendar. When integrated with Cal.com, 
                you&apos;ll be able to see real-time availability and book directly with our experts.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {/* Selected Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  <strong>Selected:</strong> {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                </p>
              </div>
            )}

            {/* Continue Button */}
            <div className="pt-4">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleContinue}
              >
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

