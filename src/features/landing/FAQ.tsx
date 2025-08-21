"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const faqs = [
  {
    question: "How does the AI matching algorithm work?",
    answer: "Our AI analyzes multiple factors including skills, experience, work preferences, location, and cultural fit to provide highly accurate matches between talents and opportunities. The algorithm continuously learns and improves from successful placements."
  },
  {
    question: "Is the platform free to use for job seekers?",
    answer: "Yes! FTN Find is completely free for talents looking for opportunities. We only charge employers for premium features and successful hires, ensuring that talented individuals always have access to our platform."
  },
  {
    question: "How do you verify talent profiles?",
    answer: "We use a multi-step verification process including email verification, professional reference checks, skill assessments, and portfolio reviews. This ensures that all profiles are authentic and accurately represent each talent's capabilities."
  },
  {
    question: "What types of opportunities are available?",
    answer: "FTN Find supports a wide range of opportunities including full-time positions, contract work, freelance projects, remote work, and part-time roles across various industries from tech and creative to business and healthcare."
  },
  {
    question: "How quickly can I find a match?",
    answer: "Our AI-powered matching can provide initial results within minutes of profile completion. However, the best matches often come from our advanced filters and ongoing optimization, which may take 24-48 hours for optimal results."
  },
  {
    question: "Do you support international hiring?",
    answer: "Absolutely! FTN Find has a global talent pool and supports international hiring. We provide guidance on visa requirements, work permits, and legal considerations for cross-border employment."
  },
  {
    question: "What support do you provide during the hiring process?",
    answer: "We offer comprehensive support including interview scheduling, communication facilitation, contract guidance, and onboarding assistance. Our dedicated support team is available to help throughout the entire process."
  },
  {
    question: "How do you ensure data privacy and security?",
    answer: "We take data security seriously with enterprise-grade encryption, secure data storage, compliance with GDPR and other privacy regulations, and strict access controls. Your data is protected and never shared without your explicit consent."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get answers to the most common questions about FTN Find
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border-border overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  <div className={`text-2xl transition-transform duration-300 ${
                    openIndex === index ? 'rotate-45' : 'rotate-0'
                  }`}>
                    +
                  </div>
                </div>
              </CardHeader>
              
              <div className={`transition-all duration-300 overflow-hidden ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <CardContent className="pt-0 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <a 
            href="#contact" 
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
