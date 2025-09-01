export default function OpportunitiesPageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-4">
        <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-10 w-28 bg-muted animate-pulse rounded-lg" />
        <div className="h-10 w-36 bg-muted animate-pulse rounded-lg" />
        <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
      </div>

      {/* Search bar skeleton */}
      <div className="relative">
        <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
      </div>

      {/* Opportunity cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
            {/* Company header */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted animate-pulse rounded-lg" />
              <div className="space-y-1">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>

            {/* Job title */}
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />

            {/* Job details */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-28 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-36 bg-muted animate-pulse rounded" />
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-6 w-16 bg-muted animate-pulse rounded-full" />
              ))}
            </div>

            {/* Match score */}
            <div className="flex items-center space-x-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-6 w-12 bg-muted animate-pulse rounded-full" />
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <div className="h-9 flex-1 bg-muted animate-pulse rounded" />
              <div className="h-9 w-12 bg-muted animate-pulse rounded" />
              <div className="h-9 w-12 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center space-x-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
}