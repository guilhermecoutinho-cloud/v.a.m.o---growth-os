// Trava de build: se algum Client Component importar este arquivo,
// o build falha em vez de embarcar a chave secreta no browser.
import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Cliente com a service_role key: ignora RLS por completo.
 *
 * NUNCA importe este arquivo em um Client Component nem em qualquer
 * codigo que chegue ao browser — a chave daria controle total do banco
 * a quem a lesse. Use somente dentro de Server Actions / Route Handlers.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ausente. Defina-a em .env.local para criar acessos.'
    )
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
