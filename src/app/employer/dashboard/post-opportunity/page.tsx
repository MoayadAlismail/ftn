"use client";

import PostOpp from "../home/components/post-opp";

export default function PostOpportunityPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post New Opportunity</h1>
        <p className="text-gray-600 mt-2">
          Create a new job posting to attract talented candidates to your organization.
        </p>
      </div>
      <PostOpp />
    </div>
  );
}