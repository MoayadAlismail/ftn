"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    CirclePlus,
    Search,
    WandSparkles,
    Briefcase,
    Mail,
    Globe2,
    Users2,
    Loader2,
    User,
    FileText
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const variants = {
    initial: { opacity: 0, y: 3 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -3 },
};

const suggestions = [
    "Software engineer intern with Python and React skills",
    "Finance major with experience in data analysis and Excel",
    "Marketing student for a social media internship at a startup",
];

interface Talent {
    id: number;
    name: string;
    email: string;
    bio: string;
    location_pref: string;
    industry_pref: string[];
    work_style_pref: string[];
}

export default function EmployerDashboardHome() {
    const [activeTab, setActiveTab] = useState("find");
    const [prompt, setprompt] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [matches, setMatches] = useState<Talent[]>([]);
    const [isLoading, setLoading] = useState(false);
    const handleSuggestionClick = (suggestion: string) => {
        setprompt(suggestion);
    };

    const handleSearch = async () => {
        setLoading(true);
        setShowResults(true);
        if (!prompt.trim()) return;

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        const response = await fetch("/api/match", {
            method: "POST",
            body: JSON.stringify(prompt),
        });

        const matchesResults = await response.json();
        console.log("🚀 Matches results:", matchesResults);
        setMatches(matchesResults);
        console.log("fetchedMatchesResults: ", matchesResults);
        setLoading(false);
    };

    return (
        <div className="container mx-auto max-w-5xl">
            <Tabs defaultValue="find" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="flex flex-row mb-3 items-center justify-center rounded-none">
                    <TabsTrigger
                        value="find"
                        className="text-sm rounded-none cursor-pointer"
                    >
                        Find Candidates
                    </TabsTrigger>
                    <TabsTrigger
                        value="post"
                        className="text-sm rounded-none cursor-pointer"
                    >
                        Post an Opportunity
                    </TabsTrigger>
                </TabsList>

                <div className="relative">
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
                                <Card className="p-6 rounded-none mb-6">
                                    <div className="flex flex-col">
                                        <div className="flex flex-row items-center">
                                            <Search className="mr-1" />
                                            <h2 className="text-xl font-bold">AI Candidate Finder</h2>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Describe your ideal candidate, and we'll find matching
                                            student profiles
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="e.g., Looking for a proactive computer science student skilled in Python and React for a summer internship. Should have experience with cloud platforms like AWS..."
                                            className="min-h-[120px]"
                                            value={prompt}
                                            onChange={(e) => setprompt(e.target.value)}
                                        />
                                        <div className="flex flex-row items-center text-xs text-gray-500 font-medium">
                                            <span>
                                                <WandSparkles size={13} className="mr-1" />
                                            </span>
                                            Or try a sample search:
                                        </div>
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
                                        <Button
                                            className="w-full cursor-pointer bg-primary hover:bg-primary/90"
                                            onClick={handleSearch}
                                        >
                                            {isLoading && (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                            Find Matching Candidates
                                        </Button>
                                    </div>
                                </Card>

                                <AnimatePresence>
                                    {showResults && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-lg font-semibold">
                                                    Matching Talents
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    {matches.length} matches found
                                                </span>
                                            </div>

                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="grid gap-4"
                                            >
                                                {matches.map((talent, index) => (
                                                    <motion.div
                                                        key={talent.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{
                                                            duration: 0.3,
                                                            delay: index * 0.1,
                                                        }}
                                                    >
                                                        <Card className="p-6 hover:shadow-md transition-shadow">
                                                            <div className="space-y-4">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                                            <User className="h-6 w-6 text-primary" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-lg font-semibold">
                                                                                {talent.name}
                                                                            </h4>
                                                                            <div className="flex items-center text-gray-500 text-sm">
                                                                                <Mail className="w-4 h-4 mr-1" />
                                                                                <span>{talent.email}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Button variant="outline" size="sm">
                                                                        View Profile
                                                                    </Button>
                                                                </div>

                                                                <div className="flex gap-2 bg-gray-50/50 p-3 rounded-md">
                                                                    <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                                                    <p className="text-gray-600 text-sm">
                                                                        {talent.bio}
                                                                    </p>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    <div className="flex items-start gap-2">
                                                                        <Briefcase className="w-4 h-4 text-gray-400 mt-1" />
                                                                        <div>
                                                                            <div className="text-xs font-medium text-gray-500 mb-1">
                                                                                Industry Preferences
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {talent.industry_pref.map(
                                                                                    (pref, i) => (
                                                                                        <span
                                                                                            key={i}
                                                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                                                                        >
                                                                                            {pref}
                                                                                        </span>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-start gap-2">
                                                                        <Users2 className="w-4 h-4 text-gray-400 mt-1" />
                                                                        <div>
                                                                            <div className="text-xs font-medium text-gray-500 mb-1">
                                                                                Work Style
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {talent.work_style_pref.map(
                                                                                    (pref, i) => (
                                                                                        <span
                                                                                            key={i}
                                                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                                                                                        >
                                                                                            {pref}
                                                                                        </span>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                                {/* Existing post tab content */}
                                <Card className="p-6 rounded-none">
                                    <h2 className="text-lg font-medium mb-6">
                                        Create a new posting that will be visible to students on the
                                        platform.
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Opportunity Title
                                            </label>
                                            <Input placeholder="Job Title" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Your Company Name
                                                </label>
                                                <Input placeholder="Company Name" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Location (e.g., Remote, San Francisco, CA)
                                                </label>
                                                <Input placeholder="Location" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Industry (e.g., Technology)
                                            </label>
                                            <Input placeholder="Industry" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Full Description
                                            </label>
                                            <Textarea
                                                placeholder="Describe the role, responsibilities, and requirements..."
                                                className="min-h-[150px]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Key Requirements (comma separated)
                                            </label>
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
