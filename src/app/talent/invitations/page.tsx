"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  User,
  MessageSquare,
  RefreshCw,
  Loader2,
  Eye,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import InvitationsPageSkeleton from "./skeleton";

// Types for invitation data
interface Invitation {
  id: string;
  employer_id: string;
  talent_id: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
  employer?: {
    id: string;
    name: string;
    company_name: string;
    email: string;
  };
}

function InvitationsPageContent() {
  const { user, authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadInvitations = async (showRefreshToast = false) => {
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);

      try {
        // Fetch invitations for the current talent with employer details
        console.log("Fetching invitations for user:", user?.id);
        const { data: invitationsData, error } = await supabase
          .from("invites")
          .select(`*, employer:employers!inner(id, name, email, company_name)`)
          .eq("talent_id", user!.id)
          .order("created_at", { ascending: false });

        console.log("Fetched invitations:", invitationsData);

        if (error) {
          console.error("Error fetching invitations:", error);
          toast.error("Failed to load invitations");
          return;
        }

        setInvitations(invitationsData || []);

        if (showRefreshToast) {
          toast.success("Invitations refreshed successfully");
        }
      } catch (error) {
        console.error("Error loading invitations:", error);
        toast.error("An error occurred while loading invitations");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    loadInvitations();
  }, [user?.id]);

  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      // Fetch invitations for the current talent with employer details
      const { data: invitationsData, error } = await supabase
        .from("invites")
        .select(
          `
                    *,
                    employer:employers!inner(
                        id,
                        name,
                        company_name,
                        email
                    )
                `
        )
        .eq("talent_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to refresh invitations");
        return;
      }

      setInvitations(invitationsData || []);
      toast.success("Invitations refreshed successfully");
    } catch (error) {
      toast.error("An error occurred while refreshing invitations");
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  const handleStatusUpdate = useCallback(
    async (invitationId: string, status: "accepted" | "rejected") => {
      setProcessingIds((prev) => new Set(prev).add(invitationId));

      try {
        const { error } = await supabase
          .from("invites")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", invitationId);

        if (error) {
          console.error("Error updating invitation:", error);
          toast.error(`Failed to ${status} invitation`);
          return;
        }

        // Update local state
        setInvitations((prev) =>
          prev.map((inv) =>
            inv.id === invitationId
              ? { ...inv, status, updated_at: new Date().toISOString() }
              : inv
          )
        );

        toast.success(`Invitation ${status} successfully`);
      } catch (error) {
        console.error(`Error ${status}ing invitation:`, error);
        toast.error(`Failed to ${status} invitation`);
      } finally {
        setProcessingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(invitationId);
          return newSet;
        });
      }
    },
    []
  );

  // Calculate stats
  const stats = {
    total: invitations.length,
    pending: invitations.filter((inv) => inv.status === "pending").length,
    accepted: invitations.filter((inv) => inv.status === "accepted").length,
    rejected: invitations.filter((inv) => inv.status === "rejected").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "accepted":
        return <CheckCircle size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      default:
        return <Mail size={16} />;
    }
  };

  if (loading) {
    return <InvitationsPageSkeleton />;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="space-y-4 md:space-y-0 md:flex md:justify-between md:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Invitations</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your employer invitations</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="w-full md:w-auto"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="text-blue-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="text-yellow-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-green-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {stats.accepted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <XCircle className="text-red-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <Card>
          <CardContent className="p-6 md:p-12 text-center">
            <Mail className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
              No invitations yet
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              When employers invite you to opportunities, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <Card
              key={invitation.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 md:p-6">
                {/* Mobile Layout - Stack vertically */}
                <div className="block md:hidden space-y-4">
                  {/* Header - Mobile */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="text-primary" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {invitation.employer?.company_name || "Company Name"}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        from {invitation.employer?.name || "Recruiter"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {formatDistanceToNow(
                          new Date(invitation.created_at)
                        )}{" "}
                        ago
                      </p>
                    </div>
                  </div>

                  {/* Status Badge - Mobile */}
                  <div className="flex justify-start">
                    <Badge
                      className={`${getStatusColor(
                        invitation.status
                      )} flex items-center gap-1 text-xs`}
                    >
                      {getStatusIcon(invitation.status)}
                      {invitation.status.charAt(0).toUpperCase() +
                        invitation.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Message - Mobile */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="text-gray-400 mt-1 flex-shrink-0" size={14} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Message:
                        </p>
                        <p className="text-sm text-gray-600 break-words">
                          {invitation.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions - Mobile */}
                  {invitation.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() =>
                          handleStatusUpdate(invitation.id, "accepted")
                        }
                        disabled={processingIds.has(invitation.id)}
                        className="w-full"
                        size="sm"
                      >
                        {processingIds.has(invitation.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Accept
                      </Button>
                      <Button
                        onClick={() =>
                          handleStatusUpdate(invitation.id, "rejected")
                        }
                        disabled={processingIds.has(invitation.id)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        {processingIds.has(invitation.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Decline
                      </Button>
                    </div>
                  )}

                  {invitation.status !== "pending" && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {invitation.status.charAt(0).toUpperCase() +
                        invitation.status.slice(1)}{" "}
                      on {formatDistanceToNow(new Date(invitation.updated_at))}{" "}
                      ago
                    </div>
                  )}
                </div>

                {/* Desktop Layout - Original horizontal layout */}
                <div className="hidden md:block">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {invitation.employer?.company_name || "Company Name"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          from {invitation.employer?.name || "Recruiter"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {formatDistanceToNow(
                            new Date(invitation.created_at)
                          )}{" "}
                          ago
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${getStatusColor(
                        invitation.status
                      )} flex items-center gap-1`}
                    >
                      {getStatusIcon(invitation.status)}
                      {invitation.status.charAt(0).toUpperCase() +
                        invitation.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="text-gray-400 mt-1" size={16} />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Message:
                        </p>
                        <p className="text-sm text-gray-600">
                          {invitation.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {invitation.status === "pending" && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() =>
                          handleStatusUpdate(invitation.id, "accepted")
                        }
                        disabled={processingIds.has(invitation.id)}
                        className="flex-1"
                      >
                        {processingIds.has(invitation.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Accept
                      </Button>
                      <Button
                        onClick={() =>
                          handleStatusUpdate(invitation.id, "rejected")
                        }
                        disabled={processingIds.has(invitation.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        {processingIds.has(invitation.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Decline
                      </Button>
                    </div>
                  )}

                  {invitation.status !== "pending" && (
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {invitation.status.charAt(0).toUpperCase() +
                        invitation.status.slice(1)}{" "}
                      on {formatDistanceToNow(new Date(invitation.updated_at))}{" "}
                      ago
                    </div>
                  )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InvitationsPage() {
  return (
    <Suspense fallback={<InvitationsPageSkeleton />}>
      <InvitationsPageContent />
    </Suspense>
  );
}
