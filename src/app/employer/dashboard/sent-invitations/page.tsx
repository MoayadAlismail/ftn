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
  User,
  MessageSquare,
  RefreshCw,
  Loader2,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SentInvitationsPageSkeleton from "./skeleton";

interface SentInvitation {
  id: string;
  employer_id: string;
  talent_id: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
  talent?: {
    id: string;
    full_name: string;
    email: string;
    bio: string;
  };
}

function SentInvitationsPageContent() {
  const { user, authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<SentInvitation[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<
    SentInvitation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadInvitations = useCallback(
    async (showRefreshToast = false) => {
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);

      try {
        const { data: invitationsData, error } = await supabase
          .from("invites")
          .select(`*, talent:talents!inner(id, full_name, email, bio)`)
          .eq("employer_id", user!.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching sent invitations:", error);
          toast.error("Failed to load sent invitations");
          return;
        }

        setInvitations(invitationsData || []);

        if (showRefreshToast) {
          toast.success("Invitations refreshed successfully");
        }
      } catch (error) {
        console.error("Error loading sent invitations:", error);
        toast.error("An error occurred while loading sent invitations");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  // Filter invitations based on search and status
  useEffect(() => {
    let filtered = invitations;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.talent?.full_name?.toLowerCase().includes(search) ||
          inv.talent?.email?.toLowerCase().includes(search) ||
          inv.message.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    setFilteredInvitations(filtered);
  }, [invitations, searchTerm, statusFilter]);

  const handleRefresh = () => {
    loadInvitations(true);
  };

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
    return <SentInvitationsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sent Invitations</h1>
          <p className="text-gray-600">Track your invitations to talents</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.accepted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            placeholder="Search by talent name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invitations List */}
      {filteredInvitations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {invitations.length === 0
                ? "No invitations sent yet"
                : "No invitations match your filters"}
            </h3>
            <p className="text-gray-600">
              {invitations.length === 0
                ? "Start sending invitations to talents to see them here."
                : "Try adjusting your search terms or filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInvitations.map((invitation) => (
            <Card
              key={invitation.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <User className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {invitation.talent?.full_name || "Talent Name"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {invitation.talent?.email || "talent@email.com"}
                        </p>
                        {/* {invitation.talent?.experience_level && (
                                                    <p className="text-xs text-gray-500">
                                                        {invitation.talent.experience_level} Experience
                                                    </p>
                                                )} */}
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          Sent{" "}
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

                  {/* Bio */}
                  {invitation.talent?.bio && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {invitation.talent.bio}
                      </p>
                    </div>
                  )}

                  {/* Message */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="text-blue-400 mt-1" size={16} />
                      <div>
                        <p className="text-sm font-medium text-blue-700 mb-1">
                          Your Message:
                        </p>
                        <p className="text-sm text-blue-600">
                          {invitation.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Info */}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SentInvitationsPage() {
  return (
    <Suspense fallback={<SentInvitationsPageSkeleton />}>
      <SentInvitationsPageContent />
    </Suspense>
  );
}
