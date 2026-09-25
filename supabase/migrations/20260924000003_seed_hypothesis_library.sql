-- ============================================================
-- Seed: biblioteca curada de possiveis causas
-- ------------------------------------------------------------
-- Cada item diz ONDE olhar, nunca POR QUE algo acontece. O texto
-- vira hipotese so quando o aluno escolhe e edita. Placeholders
-- entre chaves sao trocados pelos numeros reais na interface.
-- O admin pode editar depois pela propria tabela.
-- ============================================================

delete from hypothesis_library;

insert into hypothesis_library
  (node, lever, cause_title, how_to_check, confirming_data, hypothesis_template, possible_experiment, sort_order)
values

-- ---------- aquisicao — Volume de leads / CPL ----------------
('aquisicao', 'demanda',
 'Investimento ou orçamento insuficiente para o volume necessário',
 'Compare o investimento atual com o investimento calculado na Arquitetura.',
 'Investimento atual vs. necessário; CPL atual.',
 'SE ajustarmos o investimento para R$ {investimento_necessario}, ENTÃO esperamos chegar a {leads_necessarios} leads, PORQUE o CPL atual de R$ {cpl} se mantém estável nessa faixa.',
 'Aumentar 20–30% o investimento no canal principal por 2 semanas e medir o CPL.', 1),

('aquisicao', 'demanda',
 'Mensagem/criativo não gera interesse (CTR baixo)',
 'CTR e CPC dos anúncios nos últimos 30 dias.',
 'CTR por criativo; comparação entre criativos.',
 'SE testarmos novos criativos focados na dor do ICP, ENTÃO esperamos aumentar o CTR e reduzir o CPL, PORQUE o CTR atual indica baixa aderência da mensagem.',
 'Teste A/B com 3 criativos por 7–14 dias.', 2),

('aquisicao', 'demanda',
 'Página de conversão perde o visitante',
 'Connect rate (carregamento) e taxa de conversão da landing page.',
 'Cliques vs. visitas vs. leads.',
 'SE melhorarmos a velocidade e a clareza da LP, ENTÃO esperamos aumentar a conversão visita→lead, PORQUE há perda relevante entre clique e lead.',
 'Nova versão da LP em teste A/B.', 3),

('aquisicao', 'demanda',
 'Dependência de um único canal',
 'De onde vieram os leads e as vendas dos últimos 3 meses.',
 'Leads e vendas por canal.',
 'SE testarmos um canal secundário (indicação, outbound, parceiros), ENTÃO esperamos ampliar a demanda qualificada, PORQUE hoje o canal principal concentra a maior parte do volume.',
 'Piloto de 30 dias em um canal secundário com meta de leads.', 4),

-- ---------- lead_mql — Lead → MQL ----------------------------
('lead_mql', 'qualificacao',
 'Critério de MQL não definido ou rígido demais',
 'Existe uma regra escrita do que é MQL? Quem classifica e quando?',
 'Amostra de 20 leads não qualificados. Tinham perfil?',
 'SE definirmos um critério objetivo de MQL (segmento, porte, decisor, necessidade), ENTÃO esperamos que a taxa Lead→MQL reflita o potencial real, PORQUE hoje a classificação depende de interpretação individual.',
 'Documentar o critério e reclassificar os leads do último mês.', 1),

('lead_mql', 'qualificacao',
 'Mídia atraindo público fora do ICP',
 'Segmentação das campanhas vs. ICP definido.',
 'Perfil (cargo, porte, segmento) dos leads por campanha.',
 'SE ajustarmos a segmentação para o ICP, ENTÃO esperamos aumentar a taxa Lead→MQL de {taxa_atual} para próximo de {taxa_meta}, PORQUE parte relevante dos leads vem de fora do perfil.',
 'Campanha com segmentação restrita ao ICP vs. campanha atual.', 2),

('lead_mql', 'qualificacao',
 'Oferta ou mensagem atrai curiosos',
 'A promessa do anúncio/LP filtra quem não é cliente? Há isca gratuita genérica?',
 'Taxa de MQL por oferta/isca.',
 'SE deixarmos a oferta mais específica para o problema do ICP, ENTÃO esperamos menos leads, porém mais qualificados, PORQUE a oferta atual é ampla demais.',
 'Testar uma versão da LP com a qualificação explícita ("para empresas que faturam acima de X").', 3),

('lead_mql', 'qualificacao',
 'Formulário sem perguntas de qualificação',
 'O formulário pergunta faturamento, cargo, segmento ou momento?',
 'Campos do formulário; % de leads sem informação para qualificar.',
 'SE incluirmos 2–3 perguntas de qualificação no formulário, ENTÃO esperamos classificar melhor os leads e priorizar o contato, PORQUE hoje não há informação suficiente para qualificar.',
 'Novo formulário com perguntas de qualificação por 2 semanas.', 4),

('lead_mql', 'qualificacao',
 'Leads não são contatados ou classificados',
 'Quantos leads do mês receberam contato? Qual o tempo até o primeiro contato?',
 '% de leads contatados; tempo médio de resposta.',
 'SE garantirmos contato em até 15 minutos, ENTÃO esperamos aumentar a taxa de contato e de MQL, PORQUE parte dos leads nunca chega a ser avaliada.',
 'SLA de primeiro contato de 15 minutos por 30 dias.', 5),

('lead_mql', 'qualificacao',
 'Problema de tracking (duplicados, spam, contagem errada)',
 'Leads duplicados, testes internos, spam, integração formulário→CRM.',
 'Auditoria de 50 leads do mês.',
 'SE limparmos o tracking e a integração, ENTÃO esperamos que o número de leads reflita a realidade, PORQUE a taxa pode estar distorcida por contagem incorreta.',
 'Auditoria de pixels, UTMs e integração com o CRM.', 6),

-- ---------- mql_opp — MQL → Oportunidade ---------------------
('mql_opp', 'conversao',
 'Demora ou falta de follow-up após a qualificação',
 'Tempo entre virar MQL e o primeiro contato comercial; número de tentativas.',
 'Tempo médio de resposta; tentativas por lead.',
 'SE implementarmos uma cadência de contato (ligação + WhatsApp + e-mail em 5 dias), ENTÃO esperamos aumentar MQL→Oportunidade, PORQUE os MQLs esfriam antes da abordagem.',
 'Cadência estruturada em metade dos MQLs vs. o processo atual.', 1),

('mql_opp', 'conversao',
 'Passagem marketing → vendas sem SLA',
 'Existe um acordo de quando e como o lead é repassado? O vendedor aceita ou rejeita com motivo?',
 'MQLs repassados vs. trabalhados.',
 'SE formalizarmos um SLA entre marketing e vendas, ENTÃO esperamos que mais MQLs sejam trabalhados, PORQUE hoje parte deles se perde na passagem.',
 'SLA documentado + revisão semanal dos MQLs não trabalhados.', 2),

('mql_opp', 'conversao',
 'Abordagem inicial não gera agendamento',
 'Roteiro de primeiro contato; taxa contato→reunião.',
 'Gravações ou mensagens de abordagem; taxa de agendamento.',
 'SE mudarmos a abordagem para um diagnóstico (perguntas sobre a situação), ENTÃO esperamos aumentar o agendamento, PORQUE a abordagem atual apresenta o produto cedo demais.',
 'Novo roteiro testado por 2 semanas.', 3),

('mql_opp', 'conversao',
 'Capacidade comercial insuficiente para o volume',
 'MQLs por vendedor/mês vs. capacidade de atendimento.',
 'MQLs por vendedor; % sem contato.',
 'SE ajustarmos o volume ou a capacidade (SDR, priorização), ENTÃO esperamos atender todos os MQLs no prazo, PORQUE o time não consegue absorver o volume atual.',
 'Priorização por score dos MQLs de maior fit.', 4),

-- ---------- opp_sale — Oportunidade → Venda ------------------
('opp_sale', 'conversao',
 'Diagnóstico fraco na reunião',
 'O vendedor investiga situação, problema, impacto e objetivo antes de apresentar?',
 'Gravações de reuniões; tempo falando vs. ouvindo.',
 'SE estruturarmos a reunião com diagnóstico antes da oferta, ENTÃO esperamos aumentar Oportunidade→Venda, PORQUE hoje a proposta é apresentada sem conectar com o problema do cliente.',
 'Roteiro de reunião diagnóstica aplicado por 30 dias.', 1),

('opp_sale', 'conversao',
 'Follow-up pós-proposta inexistente ou sem valor',
 'O que acontece depois da proposta? Quantos contatos? Com qual conteúdo?',
 'Propostas sem resposta; número de follow-ups.',
 'SE aplicarmos um follow-up com contexto, prova e fechamento de ciclo (D0, D+1, D+3, D+5, D+7), ENTÃO esperamos converter mais propostas, PORQUE muitas oportunidades morrem por falta de acompanhamento.',
 'Cadência pós-proposta padronizada.', 2),

('opp_sale', 'conversao',
 'Objeções recorrentes não tratadas (preço, timing, sócio)',
 'Motivos de perda registrados no CRM.',
 'Distribuição dos motivos de perda.',
 'SE tratarmos a objeção mais frequente já no diagnóstico, ENTÃO esperamos reduzir perdas por esse motivo, PORQUE ela se repete na maioria das oportunidades perdidas.',
 'Incluir a pergunta de validação da objeção no roteiro.', 3),

('opp_sale', 'conversao',
 'Oportunidades sem qualificação real (fit, decisor, orçamento)',
 'As oportunidades têm decisor presente, orçamento e urgência?',
 '% de oportunidades com decisor; motivo "sem fit" / "sem decisão".',
 'SE só considerarmos oportunidade após validar decisor, necessidade e momento, ENTÃO esperamos uma taxa de fechamento mais real e previsível, PORQUE hoje entram oportunidades que não teriam como comprar.',
 'Critério de entrada em oportunidade documentado.', 4),

('opp_sale', 'conversao',
 'Proposta ou oferta pouco clara',
 'A proposta mostra problema, transformação, entregáveis e investimento de forma simples?',
 'Feedback de clientes perdidos; tempo de decisão.',
 'SE reescrevermos a proposta focando no resultado para o cliente, ENTÃO esperamos reduzir o tempo de decisão e aumentar o fechamento, PORQUE a proposta atual é genérica.',
 'Novo modelo de proposta em metade das oportunidades.', 5),

-- ---------- ticket — Ticket médio ----------------------------
('ticket', 'ticket',
 'Descontos frequentes para fechar',
 '% de vendas com desconto; desconto médio.',
 'Preço de tabela vs. preço praticado.',
 'SE limitarmos o desconto a critérios definidos, ENTÃO esperamos aumentar o ticket médio, PORQUE hoje o desconto é usado como argumento principal de fechamento.',
 'Política de desconto com aprovação por 30 dias.', 1),

('ticket', 'ticket',
 'Sem oferta complementar (upsell/cross-sell)',
 'Existe produto adicional ou plano superior oferecido na venda?',
 '% de vendas com item adicional.',
 'SE oferecermos um produto complementar no momento da venda, ENTÃO esperamos aumentar o ticket, PORQUE parte dos clientes tem necessidade adicional não atendida.',
 'Oferta complementar apresentada em todas as propostas.', 2),

('ticket', 'ticket',
 'Mix de clientes de menor porte',
 'Ticket por segmento/porte de cliente.',
 'Distribuição de vendas por porte.',
 'SE direcionarmos a aquisição para clientes de maior porte dentro do ICP, ENTÃO esperamos elevar o ticket, PORQUE clientes maiores compram pacotes maiores.',
 'Campanha específica para o segmento de maior ticket.', 3),

-- ---------- retencao — Recompra / Retenção / Indicação -------
('retencao', 'retencao',
 'Onboarding fraco nos primeiros 30 dias',
 'O que acontece depois da venda? Existe processo de ativação?',
 'Churn nos primeiros 90 dias.',
 'SE estruturarmos um onboarding com marcos de valor, ENTÃO esperamos reduzir o churn inicial, PORQUE o cliente não percebe resultado no começo.',
 'Checklist de onboarding para novos clientes por 60 dias.', 1),

('retencao', 'frequencia',
 'Nenhuma ação ativa de recompra',
 'Existe contato programado com a base para nova compra?',
 '% de clientes que recompraram; tempo médio entre compras.',
 'SE criarmos uma cadência de relacionamento com a base, ENTÃO esperamos aumentar a frequência de compra, PORQUE hoje a recompra depende da iniciativa do cliente.',
 'Campanha para a base ativa com oferta de recompra.', 2),

('retencao', 'indicacao',
 'Nenhum processo de indicação',
 'Vocês pedem indicação? Em que momento? Há incentivo?',
 '% de vendas vindas de indicação.',
 'SE pedirmos indicação no momento de maior satisfação (após o primeiro resultado), ENTÃO esperamos aumentar as vendas por indicação, PORQUE hoje não existe pedido estruturado.',
 'Programa de indicação piloto por 60 dias.', 3);
