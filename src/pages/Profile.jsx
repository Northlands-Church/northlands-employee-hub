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
        communication_preference: form.communication_preference || null,
        motivated_by: form.motivated_by || null,
        fun_fact: form.fun_fact || null,
      }, { onConflict: 'user_id' })
    if (profileError) throw profileError

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
