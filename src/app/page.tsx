import { EncaminhaLinkDeEmail } from './encaminha-link'

/**
 * A raiz é o Site URL do projeto no Supabase, então é aqui que caem os
 * links de convite e de recuperação quando o redirect_to não está na
 * allow list. Eles trazem a sessão no fragmento (#access_token=...),
 * que o servidor nunca enxerga — por isso o encaminhamento acontece no
 * navegador, e não com um redirect de servidor.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <EncaminhaLinkDeEmail />
    </div>
  )
}
