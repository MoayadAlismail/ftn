import { Suspense } from "react";
import EmployerDashboardHomeSkeleton from "./skeleton";
import EmployerDashboardHomeContent from "./content";

export default function EmployerDashboardHome() {
  return (
    <Suspense fallback={<EmployerDashboardHomeSkeleton />}>
      <EmployerDashboardHomeContent />
    </Suspense>
  );
}
