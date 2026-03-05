import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const STEPS = [
  { number: 1, title: 'Welcome' },
  { number: 2, title: 'Your Info' },
  { number: 3, title: 'About You' },
  { number: 4, title: 'All Done' },
]

const STRENGTHS = [
  'Achiever', 'Activator', 'Adaptability', 'Analytical', 'Arranger',
  'Belief', 'Command', 'Communication', 'Competition', 'Connectedness',
  'Consistency', 'Context', 'Deliberative', 'Developer', 'Discipline',
  'Empathy', 'Focus', 'Futuristic', 'Harmony', 'Ideation',
  'Includer', 'Individualization', 'Input', 'Intellection', 'Learner',
  'Maximizer', 'Positivity', 'Relator', 'Responsibility', 'Restorative',
  'Self-Assurance', 'Significance', 'Strategic', 'Woo'
]

const ENNEAGRAM_TYPES = [
  { value: '1', label: '1 — The Reformer' },
  { value: '2', label: '2 — The Helper' },
  { value: '3', label: '3 — The Achiever' },
  { value: '4', label: '4 — The Individualist' },
  { value: '5', label: '5 — The Investigator' },
  { value: '6', label: '6 — The Loyalist' },
  { value: '7', label: '7 — The Enthusiast' },
  { value: '8', label: '8 — The Challenger' },
  { value: '9', label: '9 — The Peacemaker' },
]

const WINGS = {
  '1': ['9', '2'], '2': ['1', '3'], '3': ['2', '4'],
  '4': ['3', '5'], '5': ['4', '6'], '6': ['5', '7'],
  '7': ['6', '8'], '8': ['7', '9'], '9': ['8', '1'],
}

export default function Setup() {
  const { user, refreshProfile } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const [form, setForm] = useState({
    full_name: '',
    title: '',
    bio: '',
    enneagram_type: '',
    enneagram_wing: '',
    strength_1: '',
    strength_2: '',
    strength_3: '',
    strength_4: '',
    strength_5: '',
    communication_preference: '',
    motivated_by: '',
    fun_fact: '',
  })

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      let avatar_url = null

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(path)
        avatar_url = urlData.publicUrl
      }

      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: form.full_name,
          avatar_url,
        })
        .eq('id', user.id)
      if (userError) throw userError

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          title: form.title,
          bio: form.bio,
          enneagram_type: form.enneagram_type || null,
          enneagram_wing: form.enneagram_wing || null,
          strength_1: form.strength_1 || null,
          strength_2: form.strength_2 || null,
          strength_3: form.strength_3 || null,
          strength_4: form.strength_4 || null,
          strength_5: form.strength_5 || null,
          communication_preference: form.communication_preference || null,
          motivated_by: form.motivated_by || null,
          fun_fact: form.fun_fact || null,
        })
      if (profileError) throw profileError

      await refreshProfile()
      setStep(4)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">

      {/* Top bar */}
      <div className="h-14 bg-[var(--surface)] border-b border-[var(--border)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/NC_Icon.png" alt="Northlands" className="w-7 h-7 object-contain" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Northlands Employee Hub</span>
        </div>
        <button onClick={toggleTheme} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {/* Step indicator */}
          {step < 4 && <StepIndicator steps={STEPS} current={step} />}

          {/* STEP 1 — Welcome */}
          {step === 1 && (
            <div className="card p-8 text-center">
              <img src="/NC_Icon.png" alt="Northlands" className="w-16 h-16 object-contain mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
                Welcome to the team! 👋
              </h1>
              <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
                Let's get your account set up. This will only take a few minutes and helps your teammates get to know you.
              </p>
              <button onClick={() => setStep(2)} className="btn-primary px-8">
                Get started
              </button>
            </div>
          )}

          {/* STEP 2 — Basic Info */}
          {step === 2 && (
            <div className="card p-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Your basic info</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">This is how you'll appear across the app.</p>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--border)] flex items-center justify-center flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl text-[var(--text-muted)]">👤</span>
                  )}
                </div>
                <div>
                  <label className="btn-secondary text-xs cursor-pointer">
                    Upload photo
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mt-1">JPG or PNG, max 2MB</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Full name *</label>
                  <input
                    className="input"
                    value={form.full_name}
                    onChange={e => update('full_name', e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="label">Job title</label>
                  <input
                    className="input"
                    value={form.title}
                    onChange={e => update('title', e.target.value)}
                    placeholder="Worship Director"
                  />
                </div>
                <div>
                  <label className="label">Short bio</label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    value={form.bio}
                    onChange={e => update('bio', e.target.value)}
                    placeholder="A little about yourself..."
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.full_name}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — About You */}
          {step === 3 && (
            <div className="card p-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">About you</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                These help your team understand how you work best. All optional.
              </p>

              <div className="space-y-5">

                {/* Enneagram */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Enneagram type</label>
                    <select
                      className="input"
                      value={form.enneagram_type}
                      onChange={e => { update('enneagram_type', e.target.value); update('enneagram_wing', '') }}
                    >
                      <option value="">Select type</option>
                      {ENNEAGRAM_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Wing</label>
                    <select
                      className="input"
                      value={form.enneagram_wing}
                      onChange={e => update('enneagram_wing', e.target.value)}
                      disabled={!form.enneagram_type}
                    >
                      <option value="">Select wing</option>
                      {form.enneagram_type && WINGS[form.enneagram_type].map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* StrengthsFinder */}
                <div>
                  <label className="label">Top 5 StrengthsFinder (in order)</label>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <select
                        key={n}
                        className="input"
                        value={form[`strength_${n}`]}
                        onChange={e => update(`strength_${n}`, e.target.value)}
                      >
                        <option value="">Strength {n}</option>
                        {STRENGTHS.filter(s =>
                          s === form[`strength_${n}`] ||
                          ![1,2,3,4,5].filter(x => x !== n).map(x => form[`strength_${x}`]).includes(s)
                        ).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>

                {/* Communication */}
                <div>
                  <label className="label">I communicate best by</label>
                  <select
                    className="input"
                    value={form.communication_preference}
                    onChange={e => update('communication_preference', e.target.value)}
                  >
                    <option value="">Select preference</option>
                    <option value="In person">In person</option>
                    <option value="Slack">Slack</option>
                    <option value="Email">Email</option>
                    <option value="Phone/text">Phone or text</option>
                    <option value="Video call">Video call</option>
                  </select>
                </div>

                {/* Motivated by */}
                <div>
                  <label className="label">I'm most motivated by</label>
                  <input
                    className="input"
                    value={form.motivated_by}
                    onChange={e => update('motivated_by', e.target.value)}
                    placeholder="e.g. Seeing people grow, creative challenges..."
                  />
                </div>

                {/* Fun fact */}
                <div>
                  <label className="label">Fun fact about me</label>
                  <input
                    className="input"
                    value={form.fun_fact}
                    onChange={e => update('fun_fact', e.target.value)}
                    placeholder="e.g. I've visited 30 countries..."
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Finish setup'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Done */}
          {step === 4 && (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-green-light flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3DBE6C" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">You're all set!</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Your profile is ready. Welcome to the Northlands team.
              </p>
              <button onClick={() => navigate('/')} className="btn-primary px-8">
                Go to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center mb-6">
      {steps.filter(s => s.number < 4).map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              current > step.number
                ? 'bg-brand-green text-white'
                : current === step.number
                ? 'bg-brand-green text-white'
                : 'bg-[var(--border)] text-[var(--text-muted)]'
            }`}>
              {current > step.number ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : step.number}
            </div>
            <span className="text-xs text-[var(--text-muted)] mt-1">{step.title}</span>
          </div>
          {i < steps.filter(s => s.number < 4).length - 1 && (
            <div className={`w-16 h-0.5 mx-2 mb-4 transition-colors ${
              current > step.number ? 'bg-brand-green' : 'bg-[var(--border)]'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}
