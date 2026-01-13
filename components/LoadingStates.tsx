import { Skeleton } from '@/components/ui/skeleton'

export const CardSkeleton = () => (
  <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-6 animate-pulse">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-accent-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-accent-200 rounded w-3/4"></div>
        <div className="h-3 bg-accent-200 rounded w-1/2 mt-1"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-accent-200 rounded w-full"></div>
      <div className="h-3 bg-accent-200 rounded w-5/6"></div>
      <div className="h-3 bg-accent-200 rounded w-4/6"></div>
    </div>
  </div>
)

export const FormSkeleton = () => (
  <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-6 animate-pulse">
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}>
          <div className="h-4 bg-accent-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-accent-200 rounded"></div>
        </div>
      ))}
      <div className="h-10 bg-accent-200 rounded w-1/4 mt-6"></div>
    </div>
  </div>
)

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden">
    <div className="divide-y divide-accent-200">
      {/* Header */}
      <div className="bg-accent-50 px-6 py-3">
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-accent-200 rounded"></div>
          ))}
        </div>
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="px-6 py-4">
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="h-4 bg-accent-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)