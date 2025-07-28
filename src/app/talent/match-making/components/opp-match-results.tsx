"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, MapPin, Building2, ChevronRight } from "lucide-react";

interface Opportunity {
    id: string;
    title: string;
    company_name: string;
    description: string;
    location: string;
    industry: string;
    workstyle: string;
    skills: string[];
    similarity: number;
    // isPremium: boolean;
}

interface OppMatchResultsProps {
    opportunities: Opportunity[];
    isLoading: boolean;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const SkillTag = ({ skill }: { skill: string }) => (
    <span className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full">
        {skill}
    </span>
);

const LoadingSkeleton = () => (
    <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
        ))}
    </div>
);

export default function OppMatchResults({ opportunities = [], isLoading = false }: OppMatchResultsProps) {
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="mx-auto px-4 py-1">
            <motion.div
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="space-y-6"
            >
                <div className="text-center space-y-4">
                    <div className="flex flex-row gap-1 justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-block"
                        >
                            <span className="text-4xl">🎉</span>
                        </motion.div>
                        <h1 className="text-3xl font-bold">Your Personalized Matches Are Ready!</h1>
                    </div>
                    <p className="text-gray-600">
                        We found {opportunities.length} opportunities that perfectly match your profile. Here are your top matches:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {opportunities.map((opp) => (
                        <motion.div key={opp.id} variants={itemVariants}>
                            <Card className="p-6 relative overflow-hidden">
                                {(true) && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500/20 to-transparent w-full h-full pointer-events-none" />
                                )}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-semibold">{opp.title}</h2>
                                            <span className={`px-3 py-1 text-sm rounded-full ${opp.similarity >= 95
                                                ? "bg-green-100 text-green-700"
                                                : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {opp.similarity}% Match
                                            </span>
                                            {opp.workstyle && (
                                                <span className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full">
                                                    {opp.workstyle}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-6 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                <span>{opp.company_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>{opp.location}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 line-clamp-2">{opp.description}</p>

                                        <div className="flex flex-wrap gap-2">
                                            {opp.skills.slice(0, 3).map((skill, i) => (
                                                <SkillTag key={i} skill={skill} />
                                            ))}
                                            {opp.skills.length > 3 && (
                                                <span className="text-sm text-gray-500">+{opp.skills.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-4">
                                        <Button
                                            variant={(true) ? "secondary" : "default"}
                                            className="flex items-center gap-2"
                                            disabled={(true)}
                                        >
                                            {(true) ? (
                                                <>
                                                    <Crown className="w-4 h-4" />
                                                    Premium
                                                </>
                                            ) : (
                                                <>
                                                    View Details
                                                    <ChevronRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8"
                >
                    <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-yellow-600" />
                                    <h3 className="text-xl font-semibold">Unlock All Premium Matches</h3>
                                </div>
                                <p className="text-gray-600">
                                    Get expert coaching to maximize your chances with these amazing opportunities
                                </p>
                            </div>
                            <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-700 hover:to-orange-700">
                                Upgrade Now
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
