export default function EmployerLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation skeleton */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-6">
            <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            <div className="flex space-x-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-24 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container py-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-72 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>

          {/* Dashboard grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="h-6 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>

          {/* Table skeleton */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center space-x-4">
                  <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}