export default function TalentDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Welcome section skeleton */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        <div className="flex space-x-3">
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="bg-background">
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1 h-10 bg-background rounded-md animate-pulse" />
          ))}
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex space-x-2">
              <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity skeleton */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}