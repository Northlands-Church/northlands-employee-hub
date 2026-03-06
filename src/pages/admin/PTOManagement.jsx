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

export default function PTOManagement() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setLoading(true)
    const { data } = await supabase
      .from('pto_requests')
      .select(`*, users!pto_requests_user_id_fkey(full_name, avatar_url)`)
      .order('created_at', { ascending: false })
    setRequests(data || [])
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
    if (!error) fetchRequests()
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="max-w-3xl space-y-5">

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
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      {req.users?.avatar_url ? (
                        <img src={req.users.avatar_url} alt={req.users.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #3DBE6C, #4BBFBF)' }}>
                          {initials(req.users?.full_name)}
                        </div>
                      )}
                    </div>
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
