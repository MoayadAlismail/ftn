"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  User, 
  Search, 
  FileText, 
  BarChart3,
  Settings,
  Briefcase
} from "lucide-react";
import TalentProfile from "@/components/talent-profile";
import { useRouter } from "next/navigation";

export default function TalentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const navigateToMatching = () => {
    router.push("/talent/match-making");
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard</h1>
        <p className="text-gray-600">Manage your profile, find opportunities, and track your applications.</p>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText size={16} />
            Applications
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Button onClick={navigateToMatching} className="w-full">
                Start Matching
              </Button>
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
                  <p className="text-sm text-gray-600">This month</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">0</div>
              <p className="text-sm text-gray-600">No applications yet</p>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h4>
              <p className="text-gray-600 mb-4">Start by finding opportunities that match your profile.</p>
              <Button onClick={navigateToMatching}>
                Find Opportunities
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <TalentProfile />
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Applications</h3>
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h4>
              <p className="text-gray-600 mb-4">
                When you apply to opportunities, they&apos;ll appear here for you to track.
              </p>
              <Button onClick={navigateToMatching}>
                Find Opportunities
              </Button>
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