"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Check,
  Sparkles,
  Crown,
  Shield,
  TrendingUp,
  Users,
  Star,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
  icon: typeof Sparkles;
  color: string;
  description: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: "pro",
    name: "FTN Pro",
    price: 29,
    interval: "month",
    description: "Perfect for active job seekers",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    features: [
      "Unlimited AI-powered job matches",
      "Priority application processing",
      "Advanced profile analytics",
      "Direct messaging with employers",
      "Resume optimization tips",
      "Interview preparation resources",
      "Priority customer support"
    ]
  },
  {
    id: "plus",
    name: "FTN Plus",
    price: 49,
    interval: "month",
    description: "For serious career advancement",
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    popular: true,
    features: [
      "Everything in FTN Pro",
      "Featured profile placement",
      "Exclusive job opportunities",
      "Personal career coach consultation",
      "Salary negotiation assistance",
      "LinkedIn profile optimization",
      "Career transition support",
      "Unlimited resume revisions",
      "Video interview practice"
    ]
  }
];

export default function TalentServicesPage() {
  const { isLoading } = useAuth();

  const handleComingSoon = () => {
    toast.info("Payment integration coming soon! We'll notify you when it's available.");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Upgrade Your Career Journey
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
            Get access to premium features and accelerate your job search with FTN Pro or Plus
          </p>
        </motion.div>

        {/* Coming Soon Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Payment integration coming soon
            </span>
          </div>
        </motion.div>
      </div>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = plan.icon;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
            >
              <Card
                className={`relative h-full ${
                  plan.popular
                    ? "border-2 border-purple-500 shadow-xl"
                    : "border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">/{plan.interval}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : ""
                    }`}
                    size="lg"
                    onClick={handleComingSoon}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Get {plan.name}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Benefits Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">Why Upgrade?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Faster Results</h3>
              <p className="text-sm text-gray-600">
                Premium members find jobs 3x faster with priority matching
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Better Connections</h3>
              <p className="text-sm text-gray-600">
                Direct access to hiring managers and exclusive opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Expert Support</h3>
              <p className="text-sm text-gray-600">
                Career coaching and personalized guidance every step
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
