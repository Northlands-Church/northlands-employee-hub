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
  const sizeClass = size === 8 ? 'w-8 h-8' : size === 6 ? 'w-6 h-6' : 'w-10 h-10'
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0`}>
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

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

function sourceLabel(source) {
  if (source === 'google_cal') return { label: 'Google Cal', color: '#4285F4' }
  if (source === 'planning_center') return { label: 'Planning Center', color: '#F97316' }
  return { label: 'Internal', color: '#6B7280' }
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [todaysPto, setTodaysPto] = useState([])
  const [birthdays, setBirthdays] = useState([])
  const [anniversaries, setAnniversaries] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])
  const [myEventIds, setMyEventIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const [ptoRes, bdRes, annivRes, announcRes, eventsRes, attendeesRes] = await Promise.all([
      supabase.from('todays_pto').select('*'),
      supabase.from('upcoming_birthdays').select('*').order('days_until'),
      supabase.from('upcoming_anniversaries').select('*'),
      supabase.from('active_announcements').select('*').limit(3),
      supabase.from('calendar_events')
        .select('*')
        .eq('start_date', today)
        .order('start_time'),
      supabase.from('event_attendees')
        .select('event_id')
        .eq('user_id', profile?.id),
    ])

    setTodaysPto(ptoRes.data || [])
    setBirthdays(bdRes.data || [])
    setAnniversaries(annivRes.data || [])
    setAnnouncements(announcRes.data || [])
    setEvents(eventsRes.data || [])
    setMyEventIds((attendeesRes.data || []).map(a => a.event_id))
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

      {/* Top row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Out Today"
          value={loading ? '—' : todaysPto.length}
          sub={todaysPto.length === 1 ? 'team member' : 'team members'}
          color="#3DBE6C"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          label="Birthdays Soon"
          value={loading ? '—' : birthdays.length}
          sub="in the next 30 days"
          color="#F97316"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
        />
        <StatCard
          label="Meetings Today"
          value={loading ? '—' : events.length}
          sub={`${myEventIds.length} involve you`}
          color="#8B5CF6"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Daily Snapshot — takes 2 cols */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green inline-block"></span>
              Today's Schedule
            </h3>
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-green inline-block"></span>
                Your meeting
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--border)] inline-block"></span>
                Other
              </span>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">No events scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {events.map(event => {
                const isMyEvent = myEventIds.includes(event.id)
                const src = sourceLabel(event.source)
                return (
                  <div key={event.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isMyEvent
                      ? 'bg-brand-green-light dark:bg-brand-green/10 border border-brand-green/20'
                      : 'bg-[var(--bg)] opacity-60'
                  }`}>
                    {/* Time */}
                    <div className="w-16 flex-shrink-0 text-right">
                      <p className={`text-xs font-semibold ${isMyEvent ? 'text-brand-green-dark' : 'text-[var(--text-muted)]'}`}>
                        {formatTime(event.start_time)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatTime(event.end_time)}
                      </p>
                    </div>

                    {/* Color bar */}
                    <div className="w-0.5 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: isMyEvent ? '#3DBE6C' : '#D1D5DB' }} />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isMyEvent ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {event.title}
                      </p>
                      {event.location && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {event.location}
                        </p>
                      )}
                    </div>

                    {/* Source badge */}
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                      style={{
                        backgroundColor: `${src.color}15`,
                        color: src.color
                      }}>
                      {src.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Who's out strip */}
          {todaysPto.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Out of Office</p>
              <div className="flex items-center gap-2 flex-wrap">
                {todaysPto.map(person => (
                  <div key={person.id} className="flex items-center gap-2 bg-[var(--bg)] rounded-full px-3 py-1">
                    <Avatar url={person.avatar_url} name={person.full_name} size={6} />
                    <span className="text-xs text-[var(--text-secondary)]">{person.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Announcements */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Announcements
            </h3>
            {loading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading...</p>
            ) : announcements.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] italic">Nothing new.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a.id} className="border-l-2 border-brand-green pl-3">
                    <div className="flex items-center gap-1">
                      {a.is_pinned && <span className="text-xs">📌</span>}
                      <p className="text-sm font-medium text-[var(--text-primary)]">{a.title}</p>
                    </div>
                    {a.body && <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{a.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Celebrations */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
              Celebrations 🎉
            </h3>
            {loading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading...</p>
            ) : birthdays.length === 0 && anniversaries.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] italic">Nothing in the next 30 days.</p>
            ) : (
              <div className="space-y-2">
                {birthdays.slice(0, 3).map(person => (
                  <div key={`bd-${person.id}`} className="flex items-center gap-2">
                    <Avatar url={person.avatar_url} name={person.full_name} size={6} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{person.full_name}</p>
                      <p className="text-xs text-[var(--text-muted)]">🎂 {person.birthday_display?.trim()}</p>
                    </div>
                    <span className="text-xs text-orange-500 font-medium flex-shrink-0">
                      {person.days_until === 0 ? 'Today!' : `${person.days_until}d`}
                    </span>
                  </div>
                ))}
                {anniversaries.slice(0, 3).map(person => (
                  <div key={`an-${person.id}`} className="flex items-center gap-2">
                    <Avatar url={person.avatar_url} name={person.full_name} size={6} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{person.full_name}</p>
                      <p className="text-xs text-[var(--text-muted)]">🎊 {person.years} year{person.years !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
