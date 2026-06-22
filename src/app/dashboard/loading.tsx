/**
 * Instant loading feedback for dashboard route transitions.
 * Next.js shows this automatically while a page's data/component
 * is being prepared, so navigation never looks "frozen" even if a
 * page does real work on mount.
 */
export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-16 border-b border-border flex items-center px-6 shrink-0">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex-1 p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-xl p-5 h-64 animate-pulse" />
      </div>
    </div>
  );
}
