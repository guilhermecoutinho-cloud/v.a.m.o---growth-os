import { EsqueletoPagina, EsqueletoCartoes, EsqueletoLista } from '@/components/vamo/esqueleto'

export default function Carregando() {
  return (
    <EsqueletoPagina>
      <EsqueletoCartoes />
      <EsqueletoLista />
    </EsqueletoPagina>
  )
}
