"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Briefcase,
    GraduationCap,
    Target,
    Trophy,
    LucideIcon,
} from "lucide-react";
import { useEffect } from "react";

type Opportunity = "full-time" | "internships" | "bootcamps" | "hackathons";

type SelectOpportunitiesProps = {
    setResumeFile: (file: File | null) => void;
    workStylePreference: string[];
    setWorkStylePreference: (workStyle: string[]) => void;
    next: () => void;
    prev: () => void;
};

const OPPORTUNITIES: {
    id: Opportunity;
    label: string;
    icon: LucideIcon;
}[] = [
        {
            id: "full-time",
            label: "Full-time Jobs",
            icon: Briefcase,
        },
        {
            id: "internships",
            label: "Internships",
            icon: GraduationCap,
        },
        {
            id: "bootcamps",
            label: "Bootcamps",
            icon: Trophy,
        },
        {
            id: "hackathons",
            label: "Hackathons",
            icon: Target,
        },
    ];

export default function SelectOpportunities({
    setResumeFile,
    workStylePreference,
    setWorkStylePreference,
    next,
    prev,
}: SelectOpportunitiesProps) {
    useEffect(() => {
        // Get the stored resume file data
        const storedResumeData = localStorage.getItem("resumeFileBase64");
        const storedFileName = localStorage.getItem("resumeFileName");

        if (storedResumeData && storedFileName) {
            // Convert base64 to blob
            const base64Response = storedResumeData.split(',')[1];
            const binaryString = window.atob(base64Response);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });

            // Create a File object
            const file = new File([blob], storedFileName, { type: 'application/pdf' });

            // Set the file
            setResumeFile(file);
        }
    }, [setResumeFile]);

    const handleValueChange = (values: string[]) => {
        setWorkStylePreference(values);
        console.log("Selected opportunities:", values); // For debugging
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-xl p-8">
                <div className="space-y-6">
                    {/* Progress indicator */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Step 1 of 4</span>
                            <span>25% Complete</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary">
                            <div className="h-full w-1/4 rounded-full bg-primary" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 text-center">
                        <Target size={40} className="mx-auto text-primary" />
                        <h1 className="text-2xl font-bold">
                            What opportunities are you looking for?
                        </h1>
                        <p className="text-muted-foreground">Select all that apply</p>
                    </div>

                    {/* Opportunities grid */}
                    <ToggleGroup
                        type="multiple"
                        className="grid grid-cols-2 gap-4"
                        value={workStylePreference}
                        onValueChange={handleValueChange}
                    >
                        {OPPORTUNITIES.map(({ id, label, icon: Icon }) => (
                            <ToggleGroupItem
                                key={id}
                                value={id}
                                className={`!rounded-xl ${id === "full-time" ? "!pl-6" : ""}
                                     flex flex-row items-center pr-20 justify-center gap-3 py-8 border-2 border-gray-200 hover:border-primary data-[state=on]:border-primary hover:bg-primary/10 data-[state=on]:bg-primary/10`}
                            >
                                <Icon
                                    size={20}
                                    className={`${workStylePreference.includes(id) ? "text-primary" : "hover:text-primary"
                                        }`}
                                />
                                <span>{label}</span>
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>

                    {/* Navigation buttons */}
                    <div className="flex justify-between pt-4">
                        <Button
                            className="cursor-pointer"
                            type="button"
                            variant="outline"
                            onClick={prev}
                        >
                            Back
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button
                                className="cursor-pointer"
                                type="button"
                                variant="ghost"
                                onClick={next}
                            >
                                Skip for now
                            </Button>
                            <Button
                                className="cursor-pointer"
                                disabled={workStylePreference.length === 0}
                                onClick={next}
                            >
                                Next &rarr;
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
