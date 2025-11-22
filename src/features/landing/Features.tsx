"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "AI-Powered Matching",
    description: "Our advanced AI algorithms match talents with opportunities based on skills, experience, and preferences.",
    icon: "🤖",
    tags: ["Smart", "Accurate", "Fast"]
  },
  {
    title: "Real-time Collaboration",
    description: "Connect instantly with employers and talents through our integrated communication platform.",
    icon: "💬",
    tags: ["Instant", "Secure", "Efficient"]
  },
  {
    title: "Global Talent Pool",
    description: "Access to a diverse network of professionals from around the world across all industries.",
    icon: "🌍",
    tags: ["Diverse", "Global", "Quality"]
  },
  {
    title: "Verified Profiles",
    description: "All profiles are verified to ensure authenticity and quality of our talent marketplace.",
    icon: "✅",
    tags: ["Trusted", "Verified", "Reliable"]
  },
  {
    title: "Smart Analytics",
    description: "Get insights into your hiring process and talent performance with detailed analytics.",
    icon: "📊",
    tags: ["Insights", "Data-driven", "Performance"]
  },
  {
    title: "Seamless Integration",
    description: "Integrate with your existing tools and workflows for a smooth talent management experience.",
    icon: "🔗",
    tags: ["Integration", "Workflow", "Productivity"]
  }
];

export default function Features() {
  return (
    <section className="py-20 bg-white border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Why Choose FTN Find?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the features that make our platform the best choice for connecting talent with opportunities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader className="text-center">
                <div className="text-4xl mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {feature.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
