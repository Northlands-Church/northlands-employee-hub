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

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">

      {/* SIDEBAR */}
      <aside className="w-60 min-h-screen bg-[var(--surface)] border-r border-[var(--border)] flex flex-col fixed left-0 top-0 bottom-0 z-50">

        {/* Logo */}
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3DBE6C, #4BBFBF)' }}>
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
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="nav-item nav-item-inactive w-full"
          >
            {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3DBE6C, #4BBFBF)' }}>
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

function getPageTitle() {
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

// ICONS
function DashboardIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
}
function DirectoryIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function CalendarIcon({ className }) {
  return <svg className={c
