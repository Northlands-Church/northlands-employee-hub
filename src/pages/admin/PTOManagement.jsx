import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

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

function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
}

function Avatar({ url, name, size = 8 }) {
  const sizeClass = size === 8 ? 'w-8 h-8' : size === 9 ? 'w-9 h-9' : 'w-10 h-10'
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0`}>
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #3DBE6C, #4BBFBF)' }}>
          {initials(name)}
        </div>
      )}
    </div>
  )
}

export default function PTOManagement() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [balances, setBalances] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [editingBalance, setEditingBalance] = useState(null)
  const [balanceInput, setBalanceInput] = useState('')
  const currentYear = new Date().getFullYear()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [reqRes, balRes, staffRes] = await Promise.all([
      supabase
        .from('pto_requests')
        .select(`*, users!pto_requests_user_id_fkey(full_name, avatar_url)`)
        .order('created_at', { ascending: false }),
      supabase
        .from('pto_balances')
        .select(`*, users(full_name, avatar_url)`)
        .eq('year', currentYear),
      supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('is_active', true)
        .order('full_name'),
    ])
    setRequests(reqRes.data || [])
    setBalances(balRes.data || [])
    setStaff(staffRes.data || [])
    setLoading(false)
  }

  async function handleReview(requestId, status, note = '', deduct = true) {
    const { error } = await supabase
      .from('pto_requests')
      .update({
        status,
        reviewer_note: note || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        deduct_from_balance: deduct,
      })
      .eq('id', requestId)
    if (!error) fetchAll()
  }

  async function handleSaveBalance(userId) {
    const days = parseFloat(balanceInput)
    if (isNaN(days) || days < 0) return

    await supabase
      .from('pto_balances')
      .upsert({
        user_id: userId,
        year: currentYear,
        total_days: days,
      }, { onConflict: 'user_id,year' })

    setEditingBalance(null)
    setBalanceInput('')
    fetchAll()
  }

  // Build staff scorecard data
  const staffScorecard = staff.map(s => {
    const balance = balances.find(b => b.user_id === s.id)
    const userRequests = requests.filter(r => r.user_id === s.id)
    const total = balance?.total_days || 0
    const used = userRequests
      .filter(r => r.status === 'approved' && r.end_date < today && r.deduct_from_balance !== false)
      .reduce((sum, r) => sum + (r.days_requested || 0), 0)
    const pending = userRequests
      .filter(r => (r.status === 'approved' || r.status === 'pending') && r.end_date >= today && r.deduct_from_balance !== false)
      .reduce((sum, r) => sum + (r.days_requested || 0), 0)
    const remaining = total - used - pending
    return { ...s, total, used, pending, remaining, hasBalance: !!balance }
  })

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="flex gap-5 items-start">

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">PTO Management</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {pendingCount > 0 ? `${pendingCount} pending request${pendingCount !== 1 ? 's' : ''} need your attention` : 'All caught up!'}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-[var(--bg)] p-1 rounded-lg w-fit">
          {[
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'denied', label: 'Denied' },
            { value: 'all', label: 'All' },
          ].map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                filter === tab.value
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-medium'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}>
              {tab.label}
              {tab.value === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 bg-brand-green text-white text-xs rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Requests list */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-5 text-sm text-[var(--text-muted)]">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-sm text-[var(--text-muted)] italic">
              No {filter === 'all' ? '' : filter} requests.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {filtered.map(req => {
                const s = STATUS_STYLES[req.status] || STATUS_STYLES.pending
                const type = PTO_TYPES.find(t => t.value === req.pto_type)
                return (
                  <div key={req.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <Avatar url={req.users?.avatar_url} name={req.users?.full_name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{req.users?.full_name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.bg} ${s.text} ${s.border}`}>
                            {s.label}
                          </span>
                          {req.deduct_from_balance === false && (
                            <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                              Not deducted
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {formatDate(req.start_date)} — {formatDate(req.end_date)} · {req.days_requested} day{req.days_requested !== 1 ? 's' : ''} · {type?.label || req.pto_type}
                        </p>
                        {req.requester_note && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1 italic">"{req.requester_note}"</p>
                        )}
                        {req.status === 'pending' && (
                          <ReviewRow requestId={req.id} ptoType={req.pto_type} onReview={handleReview} />
                        )}
                        {req.reviewer_note && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            <span className="font-medium">Note:</span> {req.reviewer_note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar — staff scorecard */}
      <div className="w-64 flex-shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {currentYear} Balances
          </p>
        </div>

        {loading ? (
          <div className="text-sm text-[var(--text-muted)]">Loading...</div>
        ) : (
          <div className="space-y-2">
            {staffScorecard.map(s => (
              <div key={s.id} className="card p-3">
                <div className="flex items-center gap-2.5 mb-2">
                  <Avatar url={s.avatar_url} name={s.full_name} size={9} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{s.full_name}</p>
                    {editingBalance === s.id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          className="input text-xs py-0.5 px-1.5 w-16"
                          value={balanceInput}
                          onChange={e => setBalanceInput(e.target.value)}
                          placeholder="days"
                          min="0"
                          step="0.5"
                          autoFocus
                        />
                        <button onClick={() => handleSaveBalance(s.id)}
                          className="text-xs text-brand-green font-medium hover:underline">
                          Save
                        </button>
                        <button onClick={() => { setEditingBalance(null); setBalanceInput('') }}
                          className="text-xs text-[var(--text-muted)] hover:underline">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingBalance(s.id); setBalanceInput(s.total.toString()) }}
                        className="text-xs text-[var(--text-muted)] hover:text-brand-green transition-colors mt-0.5 flex items-center gap-1 group">
                        {s.hasBalance ? (
                          <span>
                            <span className="font-medium text-[var(--text-secondary)]">{s.total}</span> total
                          </span>
                        ) : (
                          <span className="text-orange-500">Set balance</span>
                        )}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {s.hasBalance && (
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="bg-[var(--bg)] rounded-lg py-1">
                      <p className="text-xs font-bold text-blue-500">{s.used}</p>
                      <p className="text-xs text-[var(--text-muted)]" style={{ fontSize: '10px' }}>used</p>
                    </div>
                    <div className="bg-[var(--bg)] rounded-lg py-1">
                      <p className="text-xs font-bold text-orange-500">{s.pending}</p>
                      <p className="text-xs text-[var(--text-muted)]" style={{ fontSize: '10px' }}>pending</p>
                    </div>
                    <div className="bg-[var(--bg)] rounded-lg py-1">
                      <p className="text-xs font-bold" style={{ color: s.remaining < 3 ? '#DC2626' : '#3DBE6C' }}>
                        {s.remaining}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]" style={{ fontSize: '10px' }}>left</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewRow({ requestId, ptoType, onReview }) {
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [action, setAction] = useState(null)
  const [deduct, setDeduct] = useState(ptoType !== 'pastoral')

  const handleAction = (status) => {
    setAction(status)
    setShowNote(true)
  }

  const handleConfirm = () => {
    onReview(requestId, action, note, deduct)
    setShowNote(false)
    setNote('')
    setAction(null)
  }

  if (showNote) {
    return (
      <div className="mt-2 space-y-2">
        <input className="input text-xs" value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note (optional)..." />
        <div className="flex items-center gap-2">
          <input type="checkbox" id={`deduct-${requestId}`} checked={deduct}
            onChange={e => setDeduct(e.target.checked)} className="rounded" />
          <label htmlFor={`deduct-${requestId}`} className="text-xs text-[var(--text-secondary)]">
            Deduct from PTO balance
          </label>
          {ptoType === 'pastoral' && (
            <span className="text-xs text-[var(--text-muted)] italic">(pastoral — off by default)</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleConfirm}
            className={`text-xs px-3 py-1 rounded-lg font-medium text-white ${action === 'approved' ? 'bg-brand-green' : 'bg-red-500'}`}>
            Confirm {action === 'approved' ? 'Approval' : 'Denial'}
          </button>
          <button onClick={() => { setShowNote(false); setAction(null) }}
            className="text-xs px-3 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)]">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 mt-2">
      <button onClick={() => handleAction('approved')}
        className="text-xs px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 font-medium hover:bg-green-100 transition-colors">
        Approve
      </button>
      <button onClick={() => handleAction('denied')}
        className="text-xs px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 font-medium hover:bg-red-100 transition-colors">
        Deny
      </button>
    </div>
  )
}
