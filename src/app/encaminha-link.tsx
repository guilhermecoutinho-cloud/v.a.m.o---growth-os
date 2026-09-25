'use client'

import { useEffect } from 'react'

/**
 * Lê o fragmento da URL e manda a pessoa para o lugar certo.
 *
 * - Link de convite ou recuperação (#access_token=… ou ?code=…)
 *   → /definir-senha, levando o fragmento junto.
 * - Qualquer outro acesso → /dashboard, e o middleware decide dali.
 */
export function EncaminhaLinkDeEmail() {
  useEffect(() => {
    const hash = window.location.hash
    const busca = new URLSearchParams(window.location.search)

    const temTokenNoFragmento = hash.includes('access_token')
    const ehRecuperacao = hash.includes('type=recovery') || hash.includes('type=invite')
    const temCodigo = busca.has('code') || busca.has('token_hash')

    if (temTokenNoFragmento || ehRecuperacao) {
      window.location.replace(`/definir-senha${hash}`)
      return
    }
    if (temCodigo) {
      window.location.replace(`/auth/callback${window.location.search}`)
      return
    }
    // O link de e-mail que falha traz ?error= no fragmento.
    if (hash.includes('error')) {
      const p = new URLSearchParams(hash.slice(1))
      const descricao = p.get('error_description') ?? 'O link expirou ou já foi usado.'
      window.location.replace(`/login?error=${encodeURIComponent(descricao)}`)
      return
    }
    window.location.replace('/dashboard')
  }, [])

  return <p className="text-sm text-muted-foreground">Carregando…</p>
}
