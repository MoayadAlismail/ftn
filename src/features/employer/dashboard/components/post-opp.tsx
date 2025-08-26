import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { CirclePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const workStyles = [
  "Full Time",
  "Internships",
  "Bootcamps",
  "Hackathons",
] as const;

type WorkStyle = (typeof workStyles)[number];

interface OpportunityFormData {
  title: string;
  company_name: string;
  workstyle: WorkStyle | "";
  location: string;
  industry: string;
  description: string;
  skills: string[] | string;
}

const initialFormData: OpportunityFormData = {
  title: "",
  company_name: "",
  workstyle: "",
  location: "",
  industry: "",
  description: "",
  skills: "",
};

export default function PostOpp() {
  const [formData, setFormData] =
    useState<OpportunityFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWorkStyleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      workstyle: value as WorkStyle,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // TODO: Validate form data
      if (
        !formData.title ||
        !formData.company_name ||
        !formData.workstyle ||
        !formData.location
      ) {
        throw new Error("Please fill in all required fields");
      }

      // TODO: API call will be implemented by user
      console.log("Form submitted:", formData);
      const user = await supabase.auth.getUser();
      const user_id = user.data.user?.id;
      const dataToInsert = { ...formData, user_id: user_id };
      dataToInsert.skills = (dataToInsert.skills as string).split(",").map((skill) => skill.trim());
      console.log("full form data", dataToInsert);

      // To get the inserted row(s) back, use `.select()` after `.insert()`
      const { data, error } = await supabase
        .from("opportunities")
        .insert([dataToInsert]) // Wrap object in array
        .select()
        .single(); // .single() if you expect only one row

      if (error) {
        throw error;
      }
      toast.success("Opportunity posted successfully");
      console.log("Data inserted:", data);
      // setFormData(initialFormData);

      console.log("formData", formData);
      setIsSubmitting(false);

      const text = await Promise.all(
        [
          formData.title,
          formData.company_name,
          formData.workstyle,
          formData.location,
          formData.industry,
          formData.description,
          formData.skills
        ]
          .join("")
      );
      console.log("text", text);
      const response = await fetch("/api/get-embedding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(text),
      });
      console.log("response", response);
      if (!response.ok) {
        console.error(
          "Failed to fetch embeddings:",
          await response.json(),
          "status::",
          response.statusText
        );
        return null;
      }
      const embedding = await response.json();
      const { error: updateError } = await supabase
        .from("opportunities")
        .update({ embedding: embedding.embeddings[0].values })
        .eq("id", data.id);
      if (updateError) {
        console.error("Error updating embedding:", updateError);
      }
      // Reset form after successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
      // TODO: Show error toast
      toast.error("Error posting opportunity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 rounded-none">
      <div className="flex flex-col">
        <div className="flex flex-row items-center">
          <CirclePlus className="mr-2" />
          <h2 className="text-xl font-bold">Post a New Opportunity</h2>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Create a new posting that will be visible to students on the platform.
        </p>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="title"
            name="title"
            placeholder="Opportunity Title"
            value={formData.title}
            onChange={handleInputChange}
          />
          <Input
            id="company_name"
            name="company_name"
            placeholder="Your Company Name"
            value={formData.company_name}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            name="workstyle"
            value={formData.workstyle}
            onValueChange={handleWorkStyleChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {workStyles.map((workStyle) => (
                <SelectItem key={workStyle} value={workStyle}>
                  {workStyle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            name="location"
            placeholder="Location (e.g., Remote, San Francisco, CA)"
            value={formData.location}
            onChange={handleInputChange}
          />
        </div>

        <Input
          id="industry"
          name="industry"
          placeholder="Industry (e.g., Technology)"
          value={formData.industry}
          onChange={handleInputChange}
        />

        <Textarea
          id="description"
          name="description"
          placeholder="Describe the role, responsibilities, and requirements..."
          className="min-h-[150px]"
          value={formData.description}
          onChange={handleInputChange}
        />

        <Input
          id="skills"
          name="skills"
          placeholder="Key Requirements (comma separated, e.g., Python, React, AWS, 3.0+ GPA)"
          value={formData.skills}
          onChange={handleInputChange}
        />

        <Button
          className="w-full cursor-pointer bg-primary hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Post Opportunity
        </Button>
      </div>
    </Card>
  );
}
