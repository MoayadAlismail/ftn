export default function EmployerDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-72 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      </div>

      {/* Mode toggle skeleton */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <div className="h-10 w-32 bg-background rounded-md animate-pulse" />
          <div className="h-10 w-32 bg-background rounded-md animate-pulse" />
        </div>
      </div>

      {/* Search section skeleton */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        
        {/* Search input skeleton */}
        <div className="space-y-4">
          <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-muted animate-pulse rounded-full" />
            ))}
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex space-x-3">
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-28 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Results section skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>

        {/* Candidate cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </div>

              <div className="flex flex-wrap gap-1">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                ))}
              </div>

              <div className="flex space-x-2">
                <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                <div className="h-9 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}