-- ============================================================
-- Seed: as 9 etapas do programa V.A.M.O.
-- ============================================================

insert into program_steps (id, step_order, title, format, theme, outcome, deliverable, tool_route) values
(1, 1, 'Mentalidade de Crescimento', 'gravada', 'Mentalidade',
 'Aprender a pensar crescimento e diagnosticar antes de agir',
 'Primeira máquina + primeira hipótese', '/dashboard/funil'),

(2, 2, 'Diagnóstico da Máquina', 'ao_vivo', 'Diagnóstico da Máquina',
 'Mapear funil, indicadores, lacunas e primeira hipótese',
 'Mapa Atual da Máquina', '/dashboard/funil'),

(3, 3, 'Alcance', 'gravada', 'Alcance',
 'Aprender a gerar demanda qualificada', null, null),

(4, 4, 'Laboratório de Aquisição', 'ao_vivo', 'Laboratório de Aquisição',
 'ICP, oferta, canais e funil de aquisição',
 'Mapa de Aquisição V.A.M.O.', null),

(5, 5, 'Vendas', 'gravada', 'Vendas',
 'Transformar demanda em receita', null, null),

(6, 6, 'Laboratório Comercial', 'ao_vivo', 'Laboratório Comercial',
 'Funil comercial e funil reverso',
 'Funil Reverso V.A.M.O.', '/dashboard/arquitetura'),

(7, 7, 'Otimização', 'gravada', 'Otimização',
 'Encontrar nós e ativar alavancas', null, '/dashboard/hipoteses'),

(8, 8, 'Plano V.A.M.O. 90 dias', 'ao_vivo', 'Plano de 90 dias',
 'Priorizar hipóteses e construir o plano',
 'Plano de 90 dias', null),

(9, 9, 'Hot Seat', 'presencial', 'Hot Seat',
 'Diagnóstico, debate e decisão sobre empresas reais',
 'Decision Card', null)
on conflict (id) do update set
  step_order = excluded.step_order,
  title      = excluded.title,
  format     = excluded.format,
  theme      = excluded.theme,
  outcome    = excluded.outcome,
  deliverable= excluded.deliverable,
  tool_route = excluded.tool_route;
