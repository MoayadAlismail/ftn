export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-6">
        {/* Logo skeleton */}
        <div className="text-center">
          <div className="h-8 w-32 bg-muted animate-pulse rounded mx-auto" />
        </div>

        {/* Form skeleton */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="h-7 w-48 bg-muted animate-pulse rounded mx-auto" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto" />
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>

          {/* Submit button */}
          <div className="h-10 w-full bg-muted animate-pulse rounded" />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <div className="h-4 w-8 bg-background px-2" />
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-muted animate-pulse rounded" />
            ))}
          </div>

          {/* Footer link */}
          <div className="text-center">
            <div className="h-4 w-56 bg-muted animate-pulse rounded mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}