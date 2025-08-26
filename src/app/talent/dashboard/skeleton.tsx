export default function TalentDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-gray-200 rounded-xl h-32"></div>

      {/* Tabs skeleton */}
      <div className="space-y-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1 h-10 bg-gray-200 rounded-md"></div>
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
          ))}
        </div>

        {/* Recent activity skeleton */}
        <div className="bg-gray-200 rounded-lg h-64"></div>
      </div>
    </div>
  );
}