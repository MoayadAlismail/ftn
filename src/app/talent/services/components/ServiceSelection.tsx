"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Check } from "lucide-react";
import { Service, SERVICES } from "../types";

interface ServiceSelectionProps {
  onSelectService: (service: Service) => void;
}

export default function ServiceSelection({ onSelectService }: ServiceSelectionProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Professional Career Services
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our expert-led services to accelerate your career growth
        </p>
      </motion.div>

      {/* Service Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {SERVICES.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          >
            <Card className="h-full flex flex-col hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-400 transition-[transform,box-shadow,border-color] duration-75">
              <CardHeader className="text-center">
                <div className="text-5xl mb-4">{service.icon}</div>
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Price and Duration */}
                <div className="space-y-2 text-center py-4 border-y border-gray-100">
                  <div className="text-3xl font-bold text-gray-900">
                    {service.price} SAR
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration} minutes</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 flex-1">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => onSelectService(service)}
                >
                  Select Service
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

