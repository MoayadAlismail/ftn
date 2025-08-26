import { Suspense } from "react";
import TalentDashboardSkeleton from "./skeleton";
import TalentDashboardContent from "./content";

export default function TalentDashboard() {
  return (
    <Suspense fallback={<TalentDashboardSkeleton />}>
      <TalentDashboardContent />
    </Suspense>
  );
}