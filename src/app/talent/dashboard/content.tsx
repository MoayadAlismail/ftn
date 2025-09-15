"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import {
  User,
  Search,
  FileText,
  BarChart3,
  Settings,
  Briefcase,
  Loader2,
  Mail
} from "lucide-react";
import TalentProfile from "@/components/talent-profile";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Suspense } from "react";

export default function TalentDashboardContent() {
  const { user, authUser, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [invitationStats, setInvitationStats] = useState({ total: 0, pending: 0 });
  const [applicationStats, setApplicationStats] = useState({ total: 0, thisMonth: 0 });

  // Fetch invitation and application stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        // Fetch invitations
        const { data: invites, error: invitesError } = await supabase
          .from("invites")
          .select("status")
          .eq("talent_id", user.id);

        if (!invitesError && invites) {
          const total = invites.length;
          const pending = invites.filter(inv => inv.status === 'pending').length;
          setInvitationStats({ total, pending });
        }

        // Fetch applications
        const { data: interests, error: interestsError } = await supabase
          .from("interests")
          .select("created_at")
          .eq("user_id", user.id);

        if (!interestsError && interests) {
          const total = interests.length;
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const thisMonth = interests.filter(app => {
            const appDate = new Date(app.created_at);
            return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
          }).length;
          setApplicationStats({ total, thisMonth });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Welcome Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 md:p-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
          Welcome back{authUser?.fullName ? `, ${authUser.fullName}` : ''}!
        </h1>
        <p className="text-sm md:text-base text-gray-600">Manage your profile, find opportunities, and track your applications.</p>
      </div>

      {/* Navigation Tabs - Mobile Optimized */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <BarChart3 size={14} className="md:size-4" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <User size={14} className="md:size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <FileText size={14} className="md:size-4" />
            <span className="hidden sm:inline">Applications</span>
            <span className="sm:hidden">Apps</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Settings size={14} className="md:size-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Search size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Find Opportunities</h3>
                  <p className="text-sm text-gray-600">Discover personalized matches</p>
                </div>
              </div>
              <Link href="/talent/match-making" prefetch={true}>
                <Button className="w-full">
                  Start Matching
                </Button>
              </Link>
            </Card>

            {/* Profile Completion */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <User size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profile Status</h3>
                  <p className="text-sm text-gray-600">85% complete</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <Button variant="outline" onClick={() => setActiveTab("profile")} className="w-full">
                Complete Profile
              </Button>
            </Card>

            {/* Applications Stats */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Applications</h3>
                  <p className="text-sm text-gray-600">
                    {applicationStats.thisMonth > 0 
                      ? `${applicationStats.thisMonth} this month`
                      : 'Total applications'
                    }
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {applicationStats.total}
                {applicationStats.thisMonth > 0 && (
                  <span className="text-sm font-normal text-blue-600 ml-2">
                    ({applicationStats.thisMonth} new)
                  </span>
                )}
              </div>
              <Link href="/talent/applications" prefetch={true}>
                <Button variant="outline" className="w-full">
                  View Applications
                </Button>
              </Link>
            </Card>

            {/* Invitations */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Invitations</h3>
                  <p className="text-sm text-gray-600">
                    {invitationStats.pending > 0
                      ? `${invitationStats.pending} pending`
                      : 'From employers'
                    }
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {invitationStats.total}
                {invitationStats.pending > 0 && (
                  <span className="text-sm font-normal text-purple-600 ml-2">
                    ({invitationStats.pending} new)
                  </span>
                )}
              </div>
              <Link href="/talent/invitations" prefetch={true}>
                <Button
                  variant={invitationStats.pending > 0 ? "default" : "outline"}
                  className="w-full"
                >
                  View Invitations
                </Button>
              </Link>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h4>
              <p className="text-gray-600 mb-4">Start by finding opportunities that match your profile.</p>
              <Link href="/talent/match-making" prefetch={true}>
                <Button>
                  Find Opportunities
                </Button>
              </Link>
            </div>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Suspense fallback={
            <Card className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </Card>
          }>
            <TalentProfile />
          </Suspense>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Applications</h3>
              <Link href="/talent/applications" prefetch={true}>
                <Button variant="outline" size="sm">
                  View All Applications
                </Button>
              </Link>
            </div>
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {applicationStats.total === 0 ? "No applications yet" : `${applicationStats.total} applications`}
              </h4>
              <p className="text-gray-600 mb-4">
                {applicationStats.total === 0 
                  ? "When you apply to opportunities, they'll appear here for you to track."
                  : "Click 'View All Applications' to see detailed application status and manage your applications."
                }
              </p>
              {applicationStats.total === 0 ? (
                <Link href="/talent/match-making" prefetch={true}>
                  <Button>
                    Find Opportunities
                  </Button>
                </Link>
              ) : (
                <Link href="/talent/applications" prefetch={true}>
                  <Button>
                    Manage Applications
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive updates about new opportunities</p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium text-gray-900">Privacy Settings</h4>
                  <p className="text-sm text-gray-600">Control who can see your profile</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900">Account Data</h4>
                  <p className="text-sm text-gray-600">Download or delete your data</p>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}