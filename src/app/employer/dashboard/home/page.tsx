"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CirclePlus, Search, WandSparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const variants = {
    initial: { opacity: 0, y: 3 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -3 }
};

const suggestions = [
    "Software engineer intern with Python and React skills",
    "Finance major with experience in data analysis and Excel",
    "Marketing student for a social media internship at a startup"
];

export default function EmployerDashboardHome() {
    const [activeTab, setActiveTab] = useState("find");
    const [candidateDescription, setCandidateDescription] = useState("");

    const handleSuggestionClick = (suggestion: string) => {
        setCandidateDescription(suggestion);
    };

    return (
        <div className="container mx-auto max-w-5xl">
            <Tabs
                defaultValue="find"
                className="w-full"
                onValueChange={setActiveTab}
            >
                <TabsList className="flex flex-row mb-3 items-center justify-center rounded-none">
                    <TabsTrigger value="find" className="text-sm rounded-none cursor-pointer">Find Candidates</TabsTrigger>
                    <TabsTrigger value="post" className="text-sm rounded-none cursor-pointer">Post an Opportunity</TabsTrigger>
                </TabsList>

                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === "find" && (
                            <motion.div
                                key="find"
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                variants={variants}
                                transition={{ duration: 0.25 }}
                                className="absolute w-full"
                            >
                                <Card className="p-6 rounded-none">
                                    <div className="flex flex-col">
                                        <div className="flex flex-row items-center">
                                            <Search className="mr-1" />
                                            <h2 className="text-xl font-bold">AI Candidate Finder</h2>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">Describe your ideal candidate, and we'll find matching student profiles</p>
                                    </div>
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="e.g., Looking for a proactive computer science student skilled in Python and React for a summer internship. Should have experience with cloud platforms like AWS..."
                                            className="min-h-[120px]"
                                            value={candidateDescription}
                                            onChange={(e) => setCandidateDescription(e.target.value)}
                                        />
                                        <div className="flex flex-row items-center text-xs text-gray-500 font-medium"><span><WandSparkles size={13} className="mr-1" /></span>Or try a sample search:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((suggestion, index) => (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    className="cursor-pointer border"
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                >
                                                    {suggestion}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button className="w-full cursor-pointer bg-gray-400">Find Matching Candidates</Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === "post" && (
                            <motion.div
                                key="post"
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                variants={variants}
                                transition={{ duration: 0.25 }}
                                className="absolute w-full"
                            >
                                <Card className="p-6 rounded-none">
                                    <h2 className="text-lg font-medium mb-6">Create a new posting that will be visible to students on the platform.</h2>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Opportunity Title</label>
                                            <Input placeholder="Job Title" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Your Company Name</label>
                                                <Input placeholder="Company Name" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Location (e.g., Remote, San Francisco, CA)</label>
                                                <Input placeholder="Location" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Industry (e.g., Technology)</label>
                                            <Input placeholder="Industry" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Full Description</label>
                                            <Textarea
                                                placeholder="Describe the role, responsibilities, and requirements..."
                                                className="min-h-[150px]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Key Requirements (comma separated)</label>
                                            <Input placeholder="e.g., Python, React, AWS, 3.0+ GPA" />
                                        </div>

                                        <Button className="w-full">Post Opportunity</Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Tabs>
        </div>
    );
}
