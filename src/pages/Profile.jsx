import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STRENGTH_QUADRANTS = {
  Analytical: { quadrant: 'Strategic Thinking', color: '#10B981' },
  Context: { quadrant: 'Strategic Thinking', color: '#10B981' },
  Futuristic: { quadrant: 'Strategic Thinking', color: '#10B981' },
  Ideation: { quadrant: 'Strategic Thinking', color: '#10B981' },
  Input: { quadrant: 'Strategic Thinking', color: '#10B981' },
  Intellection: { quadrant: 'Strategic Thinking', color: '#10B981' },
  Learner: { quadrant: 'Strategic Thinking', color: '#10B981' },
  Strategic: { quadrant: 'Strategic Thinking', color: '#10B981' },
  Activator: { quadrant: 'Influencing', color: '#F97316' },
  Command: { quadrant: 'Influencing', color: '#F97316' },
  Communication: { quadrant: 'Influencing', color: '#F97316' },
  Competition: { quadrant: 'Influencing', color: '#F97316' },
  Maximizer: { quadrant: 'Influencing', color: '#F97316' },
  'Self-Assurance': { quadrant: 'Influencing', color: '#F97316' },
  Significance: { quadrant: 'Influencing', color: '#F97316' },
  Woo: { quadrant: 'Influencing', color: '#F97316' },
  Adaptability: { quadrant: 'Relationship Building', color: '#3B82F6' },
  Connectedness: { quadrant: 'Relationship Building', color: '#3B82F6' },
  Developer: { quadrant: 'Relationship Building', color: '#3B82F6' },
  Empathy: { quadrant: 'Relationship Building', color: '#3B82F6' },
  Harmony: { quadrant: 'Relationship Building', color: '#3B82F6' },
  Includer: { quadrant: 'Relationship Building', color: '#3B82F6' },
  Individualization: { quadrant: 'Relationship Building', color: '#3B82F6' },
  Positivity: { quadrant: 'Relationship Building', color: '#3B82F6' },
  Relator: { quadrant: 'Relationship Building', color: '#3B82F6' },
  Achiever: { quadrant: 'Executing', color: '#8B5CF6' },
  Arranger: { quadrant: 'Executing', color: '#8B5CF6' },
  Belief: { quadrant: 'Executing', color: '#8B5CF6' },
  Consistency: { quadrant: 'Executing', color: '#8B5CF6' },
  Deliberative: { quadrant: 'Executing', color: '#8B5CF6' },
  Discipline: { quadrant: 'Executing', color: '#8B5CF6' },
  Focus: { quadrant: 'Executing', color: '#8B5CF6' },
  Responsibility: { quadrant: 'Executing', color: '#8B5CF6' },
  Restorative: { quadrant: 'Executing', color: '#8B5CF6' },
}

const STRENGTHS = Object.keys(STRENGTH_QUADRANTS)

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

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [favForm, setFavForm] = useState({
  favorite_color: '',
  favorite_lunch: '',
  favorite_date_night_restaurant: '',
  favorite_breakfast: '',
  favorite_snacks: '',
  favorite_drink: '',
  favorite_candies: '',
  favorite_desserts: '',
  favorite_animal: '',
  favorite_tv_show: '',
  favorite_movie: '',
  fun_facts: '',
})

const updateFav = (field, value) => setFavForm(f => ({ ...f, [field]: value }))

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
    ps_visionary: '',
    ps_operator: '',
    ps_processor: '',
    ps_synergist: '',
    communication_preference: '',
    motivated_by: '',
    fun_fact: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        title: profile.profiles?.title || '',
        bio: profile.profiles?.bio || '',
        enneagram_type: profile.profiles?.enneagram_type || '',
        enneagram_wing: profile.profiles?.enneagram_wing || '',
        strength_1: profile.profiles?.strength_1 || '',
        strength_2: profile.profiles?.strength_2 || '',
        strength_3: profile.profiles?.strength_3 || '',
        strength_4: profile.profiles?.strength_4 || '',
        strength_5: profile.profiles?.strength_5 || '',
        ps_visionary: profile.profiles?.ps_visionary || '',
        ps_operator: profile.profiles?.ps_operator || '',
        ps_processor: profile.profiles?.ps_processor || '',
        ps_synergist: profile.profiles?.ps_synergist || '',
        communication_preference: profile.profiles?.communication_preference || '',
        motivated_by: profile.profiles?.motivated_by || '',
        fun_fact: profile.profiles?.fun_fact || '',
      })
      setFavForm({
        favorite_color: profile.staff_favorites?.favorite_color || '',
        favorite_lunch: profile.staff_favorites?.favorite_lunch || '',
        favorite_date_night_restaurant: profile.staff_favorites?.favorite_date_night_restaurant || '',
        favorite_breakfast: profile.staff_favorites?.favorite_breakfast || '',
        favorite_snacks: profile.staff_favorites?.favorite_snacks || '',
        favorite_drink: profile.staff_favorites?.favorite_drink || '',
        favorite_candies: profile.staff_favorites?.favorite_candies || '',
        favorite_desserts: profile.staff_favorites?.favorite_desserts || '',
        favorite_animal: profile.staff_favorites?.favorite_animal || '',
        favorite_tv_show: profile.staff_favorites?.favorite_tv_show || '',
        favorite_movie: profile.staff_favorites?.favorite_movie || '',
        fun_facts: profile.staff_favorites?.fun_facts || '',
})
    }
  }, [profile])

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
  setLoading(true)
  setError(null)
  setSuccess(false)

  try {
    let avatar_url = profile.avatar_url

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
        ...(avatar_url !== profile.avatar_url && { avatar_url }),
      })
      .eq('id', user.id)
    if (userError) throw userError

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        title: form.title || null,
        bio: form.bio || null,
        enneagram_type: form.enneagram_type || null,
        enneagram_wing: form.enneagram_wing || null,
        strength_1: form.strength_1 || null,
        strength_2: form.strength_2 || null,
        strength_3: form.strength_3 || null,
        strength_4: form.strength_4 || null,
        strength_5: form.strength_5 || null,
        ps_visionary: form.ps_visionary ? parseInt(form.ps_visionary) : null,
        ps_operator: form.ps_operator ? parseInt(form.ps_operator) : null,
        ps_processor: form.ps_processor ? parseInt(form.ps_processor) : null,
        ps_synergist: form.ps_synergist ? parseInt(form.ps_synergist) : null,
        communication_preference: form.communication_preference || null,
        motivated_by: form.motivated_by || null,
        fun_fact: form.fun_fact || null,
      }, { onConflict: 'user_id' })
    if (profileError) throw profileError

    const { error: favError } = await supabase
      .from('staff_favorites')
      .upsert({
        user_id: user.id,
        favorite_color: favForm.favorite_color || null,
        favorite_lunch: favForm.favorite_lunch || null,
        favorite_date_night_restaurant: favForm.favorite_date_night_restaurant || null,
        favorite_breakfast: favForm.favorite_breakfast || null,
        favorite_snacks: favForm.favorite_snacks || null,
        favorite_drink: favForm.favorite_drink || null,
        favorite_candies: favForm.favorite_candies || null,
        favorite_desserts: favForm.favorite_desserts || null,
        favorite_animal: favForm.favorite_animal || null,
        favorite_tv_show: favForm.favorite_tv_show || null,
        favorite_movie: favForm.favorite_movie || null,
        fun_facts: favForm.fun_facts || null,
      }, { onConflict: 'user_id' })
    if (favError) throw favError

    await refreshProfile()
    setSuccess(true)
    setEditing(false)
    setAvatarFile(null)
    setAvatarPreview(null)
    setTimeout(() => setSuccess(false), 3000)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  const avatarSrc = avatarPreview || profile?.avatar_url

  const strengths = [
    profile?.profiles?.strength_1,
    profile?.profiles?.strength_2,
    profile?.profiles?.strength_3,
    profile?.profiles?.strength_4,
    profile?.profiles?.strength_5,
  ].filter(Boolean)

  const psTotal = [form.ps_visionary, form.ps_operator, form.ps_processor, form.ps_synergist]
    .filter(Boolean)
    .reduce((sum, val) => sum + parseInt(val || 0), 0)

  const psWarning = editing && psTotal > 0 && psTotal !== 960

  return (
    <div className="max-w-2xl space-y-5">

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              {avatarSrc ? (
                <img src={avatarSrc} alt={profile?.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #3DBE6C, #4BBFBF)' }}>
                  {initials}
                </div>
              )}
            </div>
            {editing && (
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-green text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-brand-green-dark transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Full name</label>
                  <input className="input" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Job title</label>
                  <input className="input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Worship Director" />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{profile?.full_name}</h2>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">{profile?.profiles?.title || 'No title set'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] capitalize">
                    {profile?.role}
                  </span>
                  {profile?.departments?.name && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {profile.departments.name}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); setAvatarFile(null); setAvatarPreview(null) }} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-5">
          {editing ? (
            <div>
              <label className="label">Bio</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={form.bio}
                onChange={e => update('bio', e.target.value)}
                placeholder="A little about yourself..."
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">
              {profile?.profiles?.bio || <span className="text-[var(--text-muted)] italic">No bio yet — click Edit profile to add one.</span>}
            </p>
          )}
        </div>

        {success && (
          <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-600 dark:text-green-400">Profile saved successfully.</p>
          </div>
        )}
        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Personality frameworks */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Personality & Strengths</h3>

        <div className="space-y-5">

          {/* Enneagram */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Enneagram</p>
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={form.enneagram_type}
                  onChange={e => { update('enneagram_type', e.target.value); update('enneagram_wing', '') }}>
                  <option value="">Select type</option>
                  {ENNEAGRAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select className="input" value={form.enneagram_wing}
                  onChange={e => update('enneagram_wing', e.target.value)}
                  disabled={!form.enneagram_type}>
                  <option value="">Select wing</option>
                  {form.enneagram_type && WINGS[form.enneagram_type].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                {profile?.profiles?.enneagram_type
                  ? `Type ${profile.profiles.enneagram_type}${profile.profiles.enneagram_wing ? `w${profile.profiles.enneagram_wing}` : ''}`
                  : <span className="text-[var(--text-muted)] italic">Not set</span>}
              </p>
            )}
          </div>

          {/* StrengthsFinder */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Top 5 Strengths</p>
            {editing ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <select key={n} className="input" value={form[`strength_${n}`]}
                    onChange={e => update(`strength_${n}`, e.target.value)}>
                    <option value="">Strength {n}</option>
                    {STRENGTHS.filter(s =>
                      s === form[`strength_${n}`] ||
                      ![1,2,3,4,5].filter(x => x !== n).map(x => form[`strength_${x}`]).includes(s)
                    ).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {strengths.length > 0
                  ? strengths.map((s, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full font-medium text-white"
                      style={{ backgroundColor: STRENGTH_QUADRANTS[s]?.color || '#6B7280' }}>
                      {i + 1}. {s}
                    </span>
                  ))
                  : <span className="text-sm text-[var(--text-muted)] italic">Not set</span>}
              </div>
            )}
          </div>

          {/* Communication preference */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Communication preference</p>
            {editing ? (
              <select className="input" value={form.communication_preference}
                onChange={e => update('communication_preference', e.target.value)}>
                <option value="">Select preference</option>
                <option value="In person">In person</option>
                <option value="Slack">Slack</option>
                <option value="Email">Email</option>
                <option value="Phone/text">Phone or text</option>
                <option value="Video call">Video call</option>
              </select>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                {profile?.profiles?.communication_preference || <span className="text-[var(--text-muted)] italic">Not set</span>}
              </p>
            )}
          </div>

          {/* Motivated by */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Motivated by</p>
            {editing ? (
              <input className="input" value={form.motivated_by}
                onChange={e => update('motivated_by', e.target.value)}
                placeholder="e.g. Seeing people grow, creative challenges..." />
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                {profile?.profiles?.motivated_by || <span className="text-[var(--text-muted)] italic">Not set</span>}
              </p>
            )}
          </div>

          {/* Predictable Success */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Predictable Success</p>
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'ps_visionary', label: 'Visionary' },
                    { key: 'ps_operator', label: 'Operator' },
                    { key: 'ps_processor', label: 'Processor' },
                    { key: 'ps_synergist', label: 'Synergist' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max="960"
                        value={form[key]}
                        onChange={e => update(key, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <div className={`text-xs px-3 py-2 rounded-lg flex items-center justify-between ${
                  psWarning
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'
                    : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]'
                }`}>
                  <span>Total: <strong>{psTotal}</strong> / 960</span>
                  {psWarning && <span>⚠️ Should equal 960</span>}
                </div>
              </div>
            ) : (
              <div>
                {profile?.profiles?.ps_visionary != null ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Visionary', value: profile.profiles.ps_visionary },
                      { label: 'Operator', value: profile.profiles.ps_operator },
                      { label: 'Processor', value: profile.profiles.ps_processor },
                      { label: 'Synergist', value: profile.profiles.ps_synergist },
                    ].map(({ label, value }) => (
                      <div key={label} className="card p-3 text-center">
                        <p className="text-2xl font-semibold" style={{ color: value >= 480 ? '#DC2626' : value >= 240 ? '#3DBE6C' : value >= 120 ? '#3B82F6' : '#EAB308' }}>{value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-[var(--text-muted)] italic">Not set</span>
                )}
              </div>
            )}
          </div>

          {/* Fun fact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Fun fact</p>
            {editing ? (
              <input className="input" value={form.fun_fact}
                onChange={e => update('fun_fact', e.target.value)}
                placeholder="e.g. I've visited 30 countries..." />
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                {profile?.profiles?.fun_fact || <span className="text-[var(--text-muted)] italic">Not set</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    {/* Favorites */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {profile?.full_name?.split(' ')[0]}'s Favorite Things ✨
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">The little things that make them feel known</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-xs text-brand-green hover:underline">
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'favorite_color', label: '🎨 Favorite color' },
              { key: 'favorite_lunch', label: '🥗 Favorite lunch spot' },
              { key: 'favorite_date_night_restaurant', label: '🍽️ Date night restaurant' },
              { key: 'favorite_breakfast', label: '🍳 Favorite breakfast' },
              { key: 'favorite_snacks', label: '🍿 Favorite snacks' },
              { key: 'favorite_drink', label: '☕ Favorite drink' },
              { key: 'favorite_candies', label: '🍬 Favorite candies' },
              { key: 'favorite_desserts', label: '🍰 Favorite desserts' },
              { key: 'favorite_animal', label: '🐾 Favorite animal' },
              { key: 'favorite_tv_show', label: '📺 Favorite TV show' },
              { key: 'favorite_movie', label: '🎬 Favorite movie' },
              { key: 'fun_facts', label: '✨ Hidden talents' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  className="input"
                  value={favForm[key]}
                  onChange={e => updateFav(key, e.target.value)}
                  placeholder="..."
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'favorite_color', emoji: '🎨', label: 'Favorite color' },
              { key: 'favorite_lunch', emoji: '🥗', label: 'Lunch spot' },
              { key: 'favorite_date_night_restaurant', emoji: '🍽️', label: 'Date night' },
              { key: 'favorite_breakfast', emoji: '🍳', label: 'Breakfast' },
              { key: 'favorite_snacks', emoji: '🍿', label: 'Snacks' },
              { key: 'favorite_drink', emoji: '☕', label: 'Drink' },
              { key: 'favorite_candies', emoji: '🍬', label: 'Candies' },
              { key: 'favorite_desserts', emoji: '🍰', label: 'Desserts' },
              { key: 'favorite_animal', emoji: '🐾', label: 'Animal' },
              { key: 'favorite_tv_show', emoji: '📺', label: 'TV show' },
              { key: 'favorite_movie', emoji: '🎬', label: 'Movie' },
              { key: 'fun_facts', emoji: '✨', label: 'Hidden talent' },
            ].map(({ key, emoji, label }) => {
              const value = profile?.staff_favorites?.[key]
              if (!value) return null
              return (
                <div key={key} className="flex items-start gap-3 bg-[var(--bg)] rounded-xl p-3">
                  <span className="text-xl flex-shrink-0">{emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium leading-snug">{value}</p>
                  </div>
                </div>
              )
            })}
            {!Object.values(profile?.staff_favorites || {}).some(v => v && typeof v === 'string' && v.length > 0) && (
              <div className="col-span-2 text-center py-6">
                <p className="text-sm text-[var(--text-muted)] italic">No favorites added yet.</p>
                <button onClick={() => setEditing(true)} className="text-xs text-brand-green hover:underline mt-1">
                  Add your favorites
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
