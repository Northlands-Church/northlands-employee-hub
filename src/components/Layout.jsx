import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navigation = [
  {
    section: 'Main',
    items: [
      { name: 'Dashboard', path: '/', icon: DashboardIcon },
      { name: 'Staff Directory', path: '/directory', icon: DirectoryIcon },
      { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    ]
  },
  {
    section: 'My Hub',
    items: [
      { name: 'My Profile', path: '/profile', icon: ProfileIcon },
      { name: 'Time Off', path: '/pto', icon: PTOIcon },
      { name: 'My Documents', path: '/documents', icon: DocumentIcon },
    ]
  },
]

const adminNavigation = [
  {
    section: 'Admin',
    items: [
      { name: 'People', path: '/admin/people', icon: PeopleIcon },
      { name: 'PTO Management', path: '/admin/pto', icon: PTOIcon },
      { name: 'Onboarding', path: '/admin/onboarding', icon: OnboardingIcon },
      { name: 'Announcements', path: '/admin/announcements', icon: AnnouncementIcon },
      { name: 'Documents', path: '/admin/documents', icon: DocumentIcon },
    ]
  }
]

export default function Layout() {
  const { profile, isAdmin, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  const allNav = isAdmin
    ? [...navigation, ...adminNavigation]
    : navigation

  const getPageTitle = () => {
    const path = window.location.pathname
    const titles = {
      '/': 'Dashboard',
      '/directory': 'Staff Directory',
      '/calendar': 'Calendar',
      '/profile': 'My Profile',
      '/pto': 'Time Off',
      '/documents': 'My Documents',
      '/admin/people': 'People',
      '/admin/pto': 'PTO Management',
      '/admin/onboarding': 'Onboarding',
      '/admin/announcements': 'Announcements',
      '/admin/documents': 'Documents',
    }
    return titles[path] || 'Northlands Employee Hub'
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">

      {/* SIDEBAR */}
      <aside className="w-60 min-h-screen bg-[var(--surface)] border-r border-[var(--border)] flex flex-col fixed left-0 top-0 bottom-0 z-50">

        {/* Logo */}
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3DBE6C, #4BBFBF)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)] leading-tight">Northlands</div>
              <div className="text-xs text-[var(--text-muted)]">Employee Hub</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {allNav.map((group) => (
            <div key={group.section}>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-1">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
                    }
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)] space-y-1">
          <button
            onClick={toggleTheme}
            className="nav-item nav-item-inactive w-full"
          >
            {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3DBE6C, #4BBFBF)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{profile?.full_name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate capitalize">{profile?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Sign out"
            >
              <SignOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">

        {/* TOPBAR */}
        <header className="h-14 bg-[var(--surface)] border-b border-[var(--border)] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-[var(--text-primary)]">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function DashboardIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}

function DirectoryIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function ProfileIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function PTOIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  )
}

function DocumentIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

function PeopleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function OnboardingIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  )
}

function AnnouncementIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function SunIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function SignOutIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}
