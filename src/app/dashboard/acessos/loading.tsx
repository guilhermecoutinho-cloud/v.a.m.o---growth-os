import { EsqueletoPagina, EsqueletoBloco, EsqueletoLista } from '@/components/vamo/esqueleto'

export default function Carregando() {
  return (
    <EsqueletoPagina>
      <EsqueletoBloco />
      <EsqueletoLista />
    </EsqueletoPagina>
  )
}
