import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(fullName) {
  return fullName?.split(' ')[0] || ''
}

function Avatar({ url, name, size = 8 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  return (
    <div className={`w-${size} h-${size} rounded-full overflow-hidden flex-shrink-0`}>
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #3DBE6C, #4BBFBF)' }}>
          {initials}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [todaysPto, setTodaysPto] = useState([])
  const [birthdays, setBirthdays] = useState([])
  const [anniversaries, setAnniversaries] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    const [ptoRes, bdRes, annivRes, announcRes] = await Promise.all([
      supabase.from('todays_pto').select('*'),
      supabase.from('upcoming_birthdays').select('*').order('days_until'),
      supabase.from('upcoming_anniversaries').select('*'),
      supabase.from('active_announcements').select('*').limit(5),
    ])
    setTodaysPto(ptoRes.data || [])
    setBirthdays(bdRes.data || [])
    setAnniversaries(annivRes.data || [])
    setAnnouncements(announcRes.data || [])
    setLoading(false)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-sm text-[var(--text-muted)]">{today}</p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mt-0.5">
          {getGreeting()}, {getFirstName(profile?.full_name)} 👋
        </h1>
      </div>

      {/* Top row — 3 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Out Today"
          value={loading ? '—' : todaysPto.length}
          sub={todaysPto.length === 1 ? 'team member' : 'team members'}
          color="#3DBE6C"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
        <StatCard
          label="Birthdays Soon"
          value={loading ? '—' : birthdays.length}
          sub="in the next 30 days"
          color="#F97316"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          }
        />
        <StatCard
          label="Anniversaries Soon"
          value={loading ? '—' : anniversaries.length}
          sub="in the next 30 days"
          color="#8B5CF6"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Who's out today */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-green inline-block"></span>
            Who's Out Today
          </h3>
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading...</p>
          ) : todaysPto.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">Everyone's in today! 🎉</p>
          ) : (
            <div className="space-y-3">
              {todaysPto.map(person => (
                <div key={person.id} className="flex items-center gap-3">
                  <Avatar url={person.avatar_url} name={person.full_name} size={8} />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{person.full_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{person.title || 'Staff'}</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                    PTO
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            Announcements
          </h3>
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading...</p>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">No announcements right now.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="border-l-2 border-brand-green pl-3">
                  <div className="flex items-center gap-2">
                    {a.is_pinned && <span className="text-xs">📌</span>}
                    <p className="text-sm font-medium text-[var(--text-primary)]">{a.title}</p>
                  </div>
                  {a.body && <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{a.body}</p>}
                  <p className="text-xs text-[var(--text-muted)] mt-1">— {a.author_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming birthdays */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
            Upcoming Birthdays 🎂
          </h3>
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading...</p>
          ) : birthdays.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">No birthdays in the next 30 days.</p>
          ) : (
            <div className="space-y-3">
              {birthdays.map(person => (
                <div key={person.id} className="flex items-center gap-3">
                  <Avatar url={person.avatar_url} name={person.full_name} size={8} />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{person.full_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{person.birthday_display?.trim()}</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                    {person.days_until === 0 ? 'Today! 🎉' : `${person.days_until}d`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming anniversaries */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
            Work Anniversaries 🎊
          </h3>
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading...</p>
          ) : anniversaries.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">No anniversaries in the next 30 days.</p>
          ) : (
            <div className="space-y-3">
              {anniversaries.map(person => (
                <div key={person.id} className="flex items-center gap-3">
                  <Avatar url={person.avatar_url} name={person.full_name} size={8} />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{person.full_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{person.anniversary_display?.trim()}</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    {person.years} {person.years === 1 ? 'year' : 'years'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
      </div>
    </div>
  )
}
