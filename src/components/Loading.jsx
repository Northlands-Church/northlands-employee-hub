export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-green animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 rounded-full bg-brand-green animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-[var(--text-muted)] font-medium">Loading...</p>
      </div>
    </div>
  )
}
