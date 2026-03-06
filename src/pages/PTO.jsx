import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const PTO_TYPES = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'personal', label: 'Personal' },
  { value: 'maternity_paternity', label: 'Maternity / Paternity' },
  { value: 'pastoral', label: 'Pastoral' },
]

const STATUS_STYLES = {
  pending: { label: 'Pending', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  approved: { label: 'Approved', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  denied: { label: 'Denied', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysBetween(start, end, excludedWeekdays = [], holidays = []) {
  if (!start || !end) return 0
  const s = new Date(start)
  const e = new Date(end)
  let count = 0
  const current = new Date(s)
  while (current <= e) {
    const dayOfWeek = current.getDay()
    const dateStr = current.toISOString().split('T')[0]
    const isExcludedWeekday = excludedWeekdays.includes(dayOfWeek)
    const isHoliday = holidays.includes(dateStr)
    if (!isExcludedWeekday && !isHoliday) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

export default function PTO() {
  const { user } = useAuth()

  const [requests, setRequests] = useState([])
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [excludedWeekdays, setExcludedWeekdays] = useState([5, 6])
  const [holidays, setHolidays] = useState([])
  const [editingRequest, setEditingRequest] = useState(null)

  const [form, setForm] = useState({
    pto_type: 'vacation',
    start_date: '',
    end_date: '',
    requester_note: '',
  })

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  async function fetchData() {
    setLoading(true)
    const currentYear = new Date().getFullYear()

    const [reqRes, balRes, settingsRes, holidaysRes] = await Promise.all([
      supabase.from('pto_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('pto_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', currentYear)
        .single(),
      supabase.from('org_settings')
        .select('*')
        .eq('key', 'pto_excluded_weekdays')
        .single(),
      supabase.from('calendar_events')
        .select('start_date')
        .eq('event_type', 'holiday')
        .gte('start_date', `${currentYear}-01-01`)
        .lte('start_date', `${currentYear}-12-31`),
    ])

    setRequests(reqRes.data || [])
    setBalance(balRes.data || null)
    if (settingsRes.data) setExcludedWeekdays(settingsRes.data.value)
    if (holidaysRes.data) setHolidays(holidaysRes.data.map(h => h.start_date))
    setLoading(false)
  }

  const today = new Date().toISOString().split('T')[0]
  const totalDays = balance?.total_days || 0

  const usedDays = requests
    .filter(r => r.status === 'approved' && r.end_date < today && r.deduct_from_balance !== false)
    .reduce((sum, r) => sum + (r.days_requested || 0), 0)

  const pendingDays = requests
    .filter(r => (r.status === 'approved' || r.status === 'pending') && r.end_date >= today && r.deduct_from_balance !== false)
    .reduce((sum, r) => sum + (r.days_requested || 0), 0)

  const remainingDays = totalDays - usedDays - pendingDays

  function openEdit(req) {
    setEditingRequest(req)
    setForm({
      pto_type: req.pto_type,
      start_date: req.start_date,
      end_date: req.end_date,
      requester_note: req.requester_note || '',
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingRequest(null)
    setError(null)
    setForm({ pto_type: 'vacation', start_date: '', end_date: '', requester_note: '' })
  }

  async function handleSubmit() {
    if (!form.start_date || !form.end_date) {
      setError('Please select start and end dates.')
      return
    }
    if (form.end_date < form.start_date) {
      setError('End date cannot be before start date.')
      return
    }

    setSubmitting(true)
    setError(null)

    const days = daysBetween(form.start_date, form.end_date, excludedWeekdays, holidays)

    if (editingRequest) {
      const { error: updateError } = await supabase
        .from('pto_requests')
        .update({
          start_date: form.start_date,
          end_date: form.end_date,
          days_requested: days,
          pto_type: form.pto_type,
          requester_note: form.requester_note || null,
          status: 'pending',
          reviewed_by: null,
          reviewed_at: null,
          reviewer_note: null,
        })
        .eq('id', editingRequest.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess('Request updated and resubmitted for approval.')
        closeForm()
        fetchData()
        setTimeout(() => setSuccess(null), 3000)
      }
    } else {
      const { error: insertError } = await supabase
        .from('pto_requests')
        .insert({
          user_id: user.id,
          start_date: form.start_date,
          end_date: form.end_date,
          days_requested: days,
          pto_type: form.pto_type,
          requester_note: form.requester_note || null,
          status: 'pending',
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        setSuccess('Request submitted successfully!')
        closeForm()
        fetchData()
        setTimeout(() => setSuccess(null), 3000)
      }
    }
    setSubmitting(false)
  }

  async function handleDelete(requestId) {
    const { error } = await supabase
      .from('pto_requests')
      .delete()
      .eq('id', requestId)
      .eq('status', 'pending')

    if (!error) {
      setSuccess('Request deleted.')
      fetchData()
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const daysCount = daysBetween(form.start_date, form.end_date, excludedWeekdays, holidays)

  return (
    <div className="max-w-3xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Time Off</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{new Date().getFullYear()} PTO</p>
        </div>
        <button onClick={() => { closeForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Request Time Off
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Days', value: totalDays, color: '#6B7280' },
          { label: 'Used', value: usedDays, color: '#3B82F6' },
          { label: 'Pending', value: pendingDays, color: '#F97316' },
          { label: 'Remaining', value: remainingDays, color: remainingDays < 3 ? '#DC2626' : '#3DBE6C' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Request form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            {editingRequest ? 'Edit Request' : 'New Request'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.pto_type} onChange={e => update('pto_type', e.target.value)}>
                {PTO_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start date</label>
                <input className="input" type="date" value={form.start_date}
                  onChange={e => {
                    update('start_date', e.target.value)
                    if (!form.end_date || form.end_date < e.target.value) {
                      update('end_date', e.target.value)
                    }
                  }} />
              </div>
              <div>
                <label className="label">End date</label>
                <input className="input" type="date" value={form.end_date}
                  min={form.start_date}
                  onChange={e => update('end_date', e.target.value)} />
              </div>
            </div>
            {form.start_date && form.end_date && form.end_date >= form.start_date && (
              <p className="text-sm text-[var(--text-muted)]">
                That's <strong className="text-[var(--text-primary)]">
                  {daysCount} day{daysCount !== 1 ? 's' : ''}
                </strong> of PTO
              </p>
            )}
            <div>
              <label className="label">Note <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
              <textarea className="input resize-none" rows={3} value={form.requester_note}
                onChange={e => update('requester_note', e.target.value)}
                placeholder="Any context for your request..." />
            </div>
            {editingRequest && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  ⚠️ Editing this request will reset it to pending and require re-approval.
                </p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={closeForm} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="btn-primary disabled:opacity-50">
                {submitting ? 'Submitting...' : editingRequest ? 'Resubmit Request' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My requests */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">My Requests</h3>
        </div>
        {loading ? (
          <div className="p-5 text-sm text-[var(--text-muted)]">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-5 text-sm text-[var(--text-muted)] italic">No requests yet.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {requests.map(req => {
              const s = STATUS_STYLES[req.status] || STATUS_STYLES.pending
              const type = PTO_TYPES.find(t => t.value === req.pto_type)
              return (
                <div key={req.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {req.requester_note || `${formatDate(req.start_date)} — ${formatDate(req.end_date)}`}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.bg} ${s.text} ${s.border}`}>
                          {s.label}
                        </span>
                        {req.deduct_from_balance === false && (
                          <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                            Not deducted
                          </span>
                        )}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formatDate(req.start_date)} — {formatDate(req.end_date)} · {req.days_requested} day{req.days_requested !== 1 ? 's' : ''} · {type?.label || req.pto_type}
          </p>
        
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openEdit(req)}
                          className="text-xs px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(req.id)}
                          className="text-xs px-2 py-1 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
