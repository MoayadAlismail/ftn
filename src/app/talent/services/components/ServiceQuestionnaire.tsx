"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Service, QuestionnaireData, YEARS_OF_EXPERIENCE_OPTIONS } from "../types";

interface ServiceQuestionnaireProps {
  service: Service;
  onBack: () => void;
  onContinue: (data: QuestionnaireData) => void;
}

export default function ServiceQuestionnaire({ 
  service, 
  onBack, 
  onContinue 
}: ServiceQuestionnaireProps) {
  const [formData, setFormData] = useState<QuestionnaireData>({
    name: '',
    email: '',
    currentRole: '',
    yearsOfExperience: '',
    careerGoal: '',
    currentChallenge: '',
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof QuestionnaireData, string>>>({});

  const handleInputChange = (field: keyof QuestionnaireData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or DOC file');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof QuestionnaireData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.currentRole.trim()) newErrors.currentRole = 'Current role is required';
    if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
    if (!formData.careerGoal.trim()) newErrors.careerGoal = 'Career goal is required';
    if (!formData.currentChallenge.trim()) newErrors.currentChallenge = 'Current challenge is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onContinue({
        ...formData,
        resumeFile: resumeFile || undefined,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
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
          Back to Services
        </Button>

        <Card>
          <CardHeader>
            <div className="text-4xl mb-2">{service.icon}</div>
            <CardTitle className="text-2xl">{service.name}</CardTitle>
            <CardDescription className="text-base">
              {service.detailedDescription}
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Questionnaire Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Tell us about yourself</CardTitle>
            <CardDescription>
              This information helps us prepare for your session and provide personalized guidance
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Current Role */}
              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role / Field *</Label>
                <Input
                  id="currentRole"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  value={formData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  className={errors.currentRole ? 'border-red-500' : ''}
                />
                {errors.currentRole && (
                  <p className="text-sm text-red-500">{errors.currentRole}</p>
                )}
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                <Select
                  value={formData.yearsOfExperience}
                  onValueChange={(value) => handleInputChange('yearsOfExperience', value)}
                >
                  <SelectTrigger className={errors.yearsOfExperience ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS_OF_EXPERIENCE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.yearsOfExperience && (
                  <p className="text-sm text-red-500">{errors.yearsOfExperience}</p>
                )}
              </div>

              {/* Career Goal */}
              <div className="space-y-2">
                <Label htmlFor="careerGoal">Career Goal *</Label>
                <Textarea
                  id="careerGoal"
                  placeholder="What are you hoping to achieve in your career?"
                  rows={3}
                  value={formData.careerGoal}
                  onChange={(e) => handleInputChange('careerGoal', e.target.value)}
                  className={errors.careerGoal ? 'border-red-500' : ''}
                />
                {errors.careerGoal && (
                  <p className="text-sm text-red-500">{errors.careerGoal}</p>
                )}
              </div>

              {/* Current Challenge */}
              <div className="space-y-2">
                <Label htmlFor="currentChallenge">Current Challenge *</Label>
                <Textarea
                  id="currentChallenge"
                  placeholder="What's your biggest challenge right now?"
                  rows={3}
                  value={formData.currentChallenge}
                  onChange={(e) => handleInputChange('currentChallenge', e.target.value)}
                  className={errors.currentChallenge ? 'border-red-500' : ''}
                />
                {errors.currentChallenge && (
                  <p className="text-sm text-red-500">{errors.currentChallenge}</p>
                )}
              </div>

              {/* Resume Upload (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="resume">Resume (Optional)</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Upload your resume for our expert to review beforehand (PDF or DOC, max 5MB)
                </p>
                
                {!resumeFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="resume" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF or DOC up to 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{resumeFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(resumeFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full">
                  Continue to Schedule
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


