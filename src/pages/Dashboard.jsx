import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { profile } = useAuth()

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          {getGreeting()}, {firstName} 👋
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Here's what's going on today at Northlands.
        </p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">My PTO</p>
          <p className="text-3xl font-semibold text-[var(--text-primary)]">—</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Days remaining this year</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Who's Out Today</p>
          <p className="text-3xl font-semibold text-[var(--text-primary)]">—</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Staff members out</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Announcements</p>
          <p className="text-3xl font-semibold text-[var(--text-primary)]">—</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Active right now</p>
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm text-[var(--text-muted)] text-center py-8">
          Dashboard widgets loading soon — database is connected and ready. 🚀
        </p>
      </div>
    </div>
  )
}
