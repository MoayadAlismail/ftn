"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SendInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    talentId: string;
    talentName: string;
    employerId: string;
}

export default function SendInvitationModal({
    isOpen,
    onClose,
    talentId,
    talentName,
    employerId
}: SendInvitationModalProps) {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendInvitation = async () => {
        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        setIsLoading(true);

        try {
            // Check if invitation already exists
            const { data: existingInvite, error: checkError } = await supabase
                .from("invites")
                .select("id, status")
                .eq("employer_id", employerId)
                .eq("talent_id", talentId)
                .maybeSingle();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error("Error checking existing invitation:", checkError);
                toast.error("Failed to check existing invitations");
                return;
            }

            if (existingInvite) {
                if (existingInvite.status === 'pending') {
                    toast.error("You already have a pending invitation for this talent");
                    return;
                } else {
                    toast.error("You have already sent an invitation to this talent");
                    return;
                }
            }

            // Send new invitation
            const { error } = await supabase
                .from("invites")
                .insert({
                    employer_id: employerId,
                    talent_id: talentId,
                    message: message.trim(),
                    status: 'pending'
                });

            if (error) {
                console.error("Error sending invitation:", error);
                toast.error("Failed to send invitation");
                return;
            }

            toast.success(`Invitation sent to ${talentName}!`);
            setMessage("");
            onClose();
        } catch (error) {
            console.error("Error sending invitation:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Send Invitation</CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={16} />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">
                            Sending invitation to: <span className="font-semibold">{talentName}</span>
                        </p>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            Your Message *
                        </label>
                        <Textarea
                            id="message"
                            placeholder="Hi [Talent Name], I'd like to invite you to discuss an exciting opportunity at our company..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            disabled={isLoading}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {message.length}/500 characters
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendInvitation}
                            disabled={isLoading || !message.trim() || message.length > 500}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            Send Invitation
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

