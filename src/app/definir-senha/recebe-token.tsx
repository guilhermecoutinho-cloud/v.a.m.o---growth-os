'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Resgate do token que vem no fragmento da URL (#access_token=...).
 *
 * O Supabase usa esse formato quando o link de e-mail cai direto no
 * Site URL, sem passar pelo /auth/callback. O fragmento nunca chega ao
 * servidor — só o navegador o enxerga —, então a sessão precisa ser
 * montada aqui e a página recarregada para que o servidor a veja.
 */
export function RecebeToken() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('access_token')) return

    const p = new URLSearchParams(hash.slice(1))
    const access_token = p.get('access_token')
    const refresh_token = p.get('refresh_token')
    if (!access_token || !refresh_token) return

    const supabase = createClient()
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      // Limpa o fragmento e recarrega: agora o servidor enxerga a sessão.
      if (!error) window.location.replace(window.location.pathname)
    })
  }, [])

  return null
}
