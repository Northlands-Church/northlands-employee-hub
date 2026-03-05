import { useState } from 'react'
import { supabase } from '../lib/supabase'

const INVITE_MODES = [
  {
    id: 'invite',
    title: 'Send invite',
    description: 'Employee receives a magic link and completes their own profile setup.',
  },
  {
    id: 'manual',
    title: 'Manual entry',
    description: 'You fill out everything yourself. No invite sent until you\'re ready.',
  },
]

export default function AddEmployeeModal({ onClose, onSuccess, departments }) {
  const [mode, setMode] = useState('invite')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    department_id: '',
    role: 'staff',
    hire_date: '',
    title: '',
  })

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      if (mode === 'invite') {
        // Create user record first, then send invite
        const { data: authData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(form.email)
        if (inviteError) throw inviteError

        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: form.email,
          full_name: form.full_name,
          role: form.role,
          department_id: form.department_id || null,
          hire_date: form.hire_date || null,
        })
        if (userError) throw userError

      } else {
        // Manual — just create the user record, auth handled separately
        const { error: userError } = await supabase.from('users').insert({
          id: crypto.randomUUID(),
          email: form.email,
          full_name: form.full_name,
          role: form.role,
          department_id: form.department_id || null,
          hire_date: form.hire_date || null,
        })
        if (userError) throw userError
      }

      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Add Employee</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Mode selector */}
          <div>
            <label className="label">How do you want to add this employee?</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {INVITE_MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    mode === m.id
                      ? 'border-brand-green bg-brand-green-light dark:bg-brand-green/10'
                      : 'border-[var(--border)] hover:border-brand-green/50'
                  }`}
                >
                  <p className={`text-sm font-medium ${mode === m.id ? 'text-brand-green-dark' : 'text-[var(--text-primary)]'}`}>
                    {m.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">{m.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="label">Full name *</label>
              <input className="input" value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="label">Email address *</label>
              <input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="jane@northlandschurch.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={e => update('role', e.target.value)}>
                  <option value="staff">Staff</option>
                  <option value="leader">Leader</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <select className="input" value={form.department_id} onChange={e => update('department_id', e.target.value)}>
                  <option value="">Select...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Hire date</label>
                <input className="input" type="date" value={form.hire_date} onChange={e => update('hire_date', e.target.value)} />
              </div>
              <div>
                <label className="label">Job title</label>
                <input className="input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Worship Director" />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border)]">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.full_name || !form.email}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : mode === 'invite' ? 'Send invite' : 'Add employee'}
          </button>
        </div>
      </div>
    </div>
  )
}
