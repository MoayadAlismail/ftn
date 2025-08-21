"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const testimonials = [
    {
        name: "Sarah Chen",
        role: "Senior Software Engineer",
        company: "TechCorp Inc.",
        avatar: "👩‍💻",
        content: "FTN Find completely transformed my job search. The AI matching was so accurate that I found my dream job within two weeks. The platform made the entire process seamless and stress-free.",
        rating: 5,
        tags: ["Software Engineer", "Remote Work"]
    },
    {
        name: "Marcus Johnson",
        role: "Hiring Manager",
        company: "StartupXYZ",
        avatar: "👨‍💼",
        content: "As a hiring manager, FTN Find has been a game-changer. We've reduced our time-to-hire by 60% and the quality of candidates has been exceptional. The verification process ensures we only see top talent.",
        rating: 5,
        tags: ["Employer", "Startup"]
    },
    {
        name: "Elena Rodriguez",
        role: "UX Designer",
        company: "Design Studio Pro",
        avatar: "👩‍🎨",
        content: "The platform understood my design aesthetic and career goals perfectly. I was matched with companies that truly valued creative talent. The interview process was smooth and professional.",
        rating: 5,
        tags: ["UX Design", "Creative"]
    },
    {
        name: "David Kim",
        role: "Data Scientist",
        company: "Analytics Corp",
        avatar: "👨‍🔬",
        content: "FTN Find's AI really understands the nuances of data science roles. I was matched with positions that perfectly aligned with my expertise in machine learning and statistical analysis.",
        rating: 5,
        tags: ["Data Science", "AI/ML"]
    },
    {
        name: "Amanda Foster",
        role: "Product Manager",
        company: "Innovation Labs",
        avatar: "👩‍💼",
        content: "The global reach of FTN Find opened up opportunities I never knew existed. I found an amazing remote position with a international team that values work-life balance.",
        rating: 5,
        tags: ["Product Management", "International"]
    },
    {
        name: "James Wilson",
        role: "CTO",
        company: "ScaleUp Solutions",
        avatar: "👨‍💻",
        content: "We've hired 15+ exceptional engineers through FTN Find. The platform's verification system and matching algorithm have helped us build a world-class development team efficiently.",
        rating: 5,
        tags: ["Leadership", "Tech Hiring"]
    }
];

export default function Testimonials() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        What Our Community Says
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Real stories from talents and employers who have found success through FTN Find
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="text-3xl mr-3">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">
                                            {testimonial.name}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {testimonial.role}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {testimonial.company}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-lg">★</span>
                                    ))}
                                </div>

                                <p className="text-muted-foreground leading-relaxed mb-4 text-sm">
                                    "{testimonial.content}"
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {testimonial.tags.map((tag, tagIndex) => (
                                        <Badge key={tagIndex} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <div className="inline-flex items-center space-x-8 p-6 bg-card rounded-lg border border-border">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">10,000+</div>
                            <div className="text-sm text-muted-foreground">Successful Matches</div>
                        </div>
                        <div className="h-12 w-px bg-border"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">95%</div>
                            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                        </div>
                        <div className="h-12 w-px bg-border"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">500+</div>
                            <div className="text-sm text-muted-foreground">Partner Companies</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

