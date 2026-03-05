import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import AddEmployeeModal from '../components/AddEmployeeModal'

export default function Directory() {
  const { isAdmin } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDept, setSelectedDept] = useState('')
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  async function fetchEmployees() {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select(`*, departments(name), profiles(title, enneagram_type, strength_1)`)
      .eq('is_active', true)
      .order('full_name')
    if (!error) setEmployees(data || [])
    setLoading(false)
  }

  async function fetchDepartments() {
    const { data } = await supabase.from('departments').select('*').order('name')
    setDepartments(data || [])
  }

  const filtered = employees.filter(e => {
    const matchSearch = !search ||
      e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.title?.toLowerCase().includes(search.toLowerCase())
    const matchDept = !selectedDept || e.department_id === selectedDept
    return matchSearch && matchDept
  })

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Staff Directory</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{employees.length} team members</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          className="input max-w-xs"
          placeholder="Search by name or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input max-w-[180px]"
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
        >
          <option value="">All departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-brand-green text-white' : 'text-[var(--text-muted)] hover:bg-[var(--border)]'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-brand-green text-white' : 'text-[var(--text-muted)] hover:bg-[var(--border)]'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-[var(--text-muted)]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          {search || selectedDept ? 'No results found.' : 'No employees yet.'}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(emp => (
            <div key={emp.id} className="card p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 flex-shrink-0">
                {emp.avatar_url ? (
                  <img src={emp.avatar_url} alt={emp.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #3DBE6C, #4BBFBF)' }}>
                    {initials(emp.full_name)}
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{emp.full_name}</p>
              {emp.profiles?.title && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-tight">{emp.profiles.title}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Department</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <tr key={emp.id} className={`hover:bg-[var(--bg)] transition-colors cursor-pointer ${i < filtered.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        {emp.avatar_url ? (
                          <img src={emp.avatar_url} alt={emp.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-white"
                            style={{ background: 'linear-gradient(135deg, #3DBE6C, #4BBFBF)' }}>
                            {initials(emp.full_name)}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{emp.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{emp.profiles?.title || '—'}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{emp.departments?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchEmployees() }}
          departments={departments}
        />
      )}
    </div>
  )
}
