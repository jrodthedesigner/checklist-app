export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-5 w-40 bg-warm-200 rounded-lg mb-2" />
          <div className="h-3 w-56 bg-warm-100 rounded-lg" />
        </div>
        <div className="h-8 w-8 bg-warm-100 rounded-lg" />
      </div>
      <div className="h-2 w-full bg-warm-100 rounded-full mb-2" />
      <div className="h-3 w-20 bg-warm-100 rounded-lg" />
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 bg-warm-200 rounded-lg" />
      <div className="h-4 w-96 bg-warm-100 rounded-lg" />
      <div className="h-2 w-full bg-warm-100 rounded-full mt-6" />
      <div className="space-y-3 mt-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl">
            <div className="h-5 w-5 bg-warm-200 rounded" />
            <div className="h-4 flex-1 bg-warm-100 rounded-lg" />
            <div className="h-5 w-12 bg-warm-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
