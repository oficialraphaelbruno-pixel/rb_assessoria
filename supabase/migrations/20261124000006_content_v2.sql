-- =====================================================================
-- Conteúdo v2: topo da home, fundador (formação, experiência, visão),
-- FAQ completo (redes sociais, vendas, sites, SaaS, automação, planos)
-- e os planos Bronze, Prata, Ouro e Ultra Diamante.
-- Preços dos planos ficam "Sob consulta" até a RB definir no painel.
-- =====================================================================

-- Topo da página inicial
update public.site_settings set
  draft = draft || $j${
    "eyebrow": "Social media · Sites · Sistemas SaaS · Automação com IA",
    "title": "Sua marca vista, lembrada e escolhida.",
    "subtitle": "Estratégia de redes sociais, conteúdo que gera conversa, sites que convertem e sistemas que organizam seu atendimento. Tudo integrado por uma assessoria que acompanha cada etapa de perto, do primeiro post à venda.",
    "primary_cta_label": "Agendar diagnóstico",
    "primary_cta_href": "/contato#orcamento",
    "secondary_cta_label": "Conhecer os planos",
    "secondary_cta_href": "/planos"
  }$j$::jsonb,
  published = published || $j${
    "eyebrow": "Social media · Sites · Sistemas SaaS · Automação com IA",
    "title": "Sua marca vista, lembrada e escolhida.",
    "subtitle": "Estratégia de redes sociais, conteúdo que gera conversa, sites que convertem e sistemas que organizam seu atendimento. Tudo integrado por uma assessoria que acompanha cada etapa de perto, do primeiro post à venda.",
    "primary_cta_label": "Agendar diagnóstico",
    "primary_cta_href": "/contato#orcamento",
    "secondary_cta_label": "Conhecer os planos",
    "secondary_cta_href": "/planos"
  }$j$::jsonb
where key = 'hero';

-- Chamada final
update public.site_settings set
  draft = draft || $j${"title": "Pronto para transformar seguidores em clientes?", "text": "Conte o momento da sua marca. Em uma conversa de diagnóstico, mapeamos oportunidades nas redes, no site e no atendimento e indicamos o plano ideal para o seu objetivo.", "button_label": "Quero meu diagnóstico"}$j$::jsonb,
  published = published || $j${"title": "Pronto para transformar seguidores em clientes?", "text": "Conte o momento da sua marca. Em uma conversa de diagnóstico, mapeamos oportunidades nas redes, no site e no atendimento e indicamos o plano ideal para o seu objetivo.", "button_label": "Quero meu diagnóstico"}$j$::jsonb
where key = 'cta_final';

-- Quem está por trás da RB
update public.site_settings set
  draft = draft || $j${
    "headline": "Gestão, esporte e comunicação a serviço da sua marca",
    "role": "Fundador e estrategista",
    "bio": [
      "Meu nome é Raphael Bruno. Sou belo-horizontino por escolha e de coração, e construí minha trajetória no encontro entre gestão, esporte de alto rendimento e comunicação. Foi nessa combinação que nasceu a RB: ajudar empresas, profissionais e projetos esportivos a traduzirem o valor do que fazem em uma presença digital clara, profissional e próxima do público.",
      "O esporte me ensinou disciplina, constância e leitura de desempenho. A gestão me deu visão de processo e de resultado. Vendas e marketing completaram o caminho: entender o cliente, posicionar a marca e transformar atenção em oportunidade real de negócio.",
      "Na RB, mergulho na realidade de cada cliente para organizar ideias e transformar objetivos em conteúdo com direção, sites que convertem e sistemas que facilitam o dia a dia. Mais do que deixar um perfil bonito, quero que cada marca seja compreendida, lembrada e escolhida."
    ],
    "quote": "Comunicação boa não é a que aparece mais. É a que faz o público entender, confiar e escolher a sua marca.",
    "experience": "Formação nas áreas de gestão e esporte de alto rendimento, com experiência prática em vendas, marketing e comunicação. Atuação em gestão de redes sociais, produção de conteúdo, posicionamento de marcas pessoais, comunicação para o futebol de base e eventos esportivos, desenvolvimento de sites e sistemas, e automação de atendimento.",
    "specialties": ["Estratégia de redes sociais", "Marketing esportivo", "Vendas e prospecção", "Comunicação e posicionamento de marca", "Produção de conteúdo e edição de vídeo", "Sites, landing pages e sistemas SaaS", "Automação de atendimento e CRM"],
    "values": ["Transparência em cada etapa e em cada número", "Proximidade: atendimento direto, sem intermediários", "Constância antes de atalhos", "Decisões guiadas por dados, sem perder o olhar humano", "Evolução contínua, como no esporte de alto rendimento"],
    "vision": "Ser referência em comunicação estratégica para o esporte, marcas pessoais e negócios em crescimento, unindo criatividade, dados e tecnologia para transformar presença digital em oportunidades reais, com atendimento próximo de Belo Horizonte para todo o Brasil."
  }$j$::jsonb,
  published = published || $j${
    "headline": "Gestão, esporte e comunicação a serviço da sua marca",
    "role": "Fundador e estrategista",
    "bio": [
      "Meu nome é Raphael Bruno. Sou belo-horizontino por escolha e de coração, e construí minha trajetória no encontro entre gestão, esporte de alto rendimento e comunicação. Foi nessa combinação que nasceu a RB: ajudar empresas, profissionais e projetos esportivos a traduzirem o valor do que fazem em uma presença digital clara, profissional e próxima do público.",
      "O esporte me ensinou disciplina, constância e leitura de desempenho. A gestão me deu visão de processo e de resultado. Vendas e marketing completaram o caminho: entender o cliente, posicionar a marca e transformar atenção em oportunidade real de negócio.",
      "Na RB, mergulho na realidade de cada cliente para organizar ideias e transformar objetivos em conteúdo com direção, sites que convertem e sistemas que facilitam o dia a dia. Mais do que deixar um perfil bonito, quero que cada marca seja compreendida, lembrada e escolhida."
    ],
    "quote": "Comunicação boa não é a que aparece mais. É a que faz o público entender, confiar e escolher a sua marca.",
    "experience": "Formação nas áreas de gestão e esporte de alto rendimento, com experiência prática em vendas, marketing e comunicação. Atuação em gestão de redes sociais, produção de conteúdo, posicionamento de marcas pessoais, comunicação para o futebol de base e eventos esportivos, desenvolvimento de sites e sistemas, e automação de atendimento.",
    "specialties": ["Estratégia de redes sociais", "Marketing esportivo", "Vendas e prospecção", "Comunicação e posicionamento de marca", "Produção de conteúdo e edição de vídeo", "Sites, landing pages e sistemas SaaS", "Automação de atendimento e CRM"],
    "values": ["Transparência em cada etapa e em cada número", "Proximidade: atendimento direto, sem intermediários", "Constância antes de atalhos", "Decisões guiadas por dados, sem perder o olhar humano", "Evolução contínua, como no esporte de alto rendimento"],
    "vision": "Ser referência em comunicação estratégica para o esporte, marcas pessoais e negócios em crescimento, unindo criatividade, dados e tecnologia para transformar presença digital em oportunidades reais, com atendimento próximo de Belo Horizonte para todo o Brasil."
  }$j$::jsonb
where key = 'founder';

-- Bloco da página de planos
insert into public.site_settings (key, label, draft, published)
select 'plans_page', 'Página de planos', v, v from (select $j${
  "eyebrow": "Planos",
  "title": "Um plano para cada momento da sua marca",
  "subtitle": "Do primeiro passo nas redes sociais ao ecossistema digital completo, com conteúdo, site, automação, e-mail marketing e sistema próprio. Todos os planos começam com um diagnóstico e podem ser ajustados à sua realidade.",
  "note": "Valores e quantidades finais são definidos na proposta, após o diagnóstico. Licenças de ferramentas de terceiros (ManyChat, WhatsApp Business API) e verba de anúncios são pagas à parte, diretamente pelo cliente."
}$j$::jsonb as v) t
on conflict (key) do nothing;

-- Planos: substitui os rascunhos antigos pelos pacotes completos
delete from public.plans where product = 'saas-agendamento' and status = 'draft' and price_cents is null;
insert into public.plans (product, name, tagline, price_cents, billing_period, features, highlighted, cta_label, sort_order, status) values
('pacote-rb', 'Bronze', 'Presença essencial: organização e constância nas redes', null, 'mensal',
 '["Diagnóstico do perfil e definição de posicionamento","Gestão de 1 rede social (Instagram)","Planejamento e calendário editorial mensal","8 publicações por mês (posts e carrosséis)","Legendas com copy e chamadas para ação","Identidade visual padronizada nas artes","Relatório mensal de desempenho","Atendimento por WhatsApp em horário comercial"]',
 false, 'Começar pelo Bronze', 10, 'published'),
('pacote-rb', 'Prata', 'Crescimento com estratégia: mais conteúdo, vídeo e captação', null, 'mensal',
 '["Tudo do plano Bronze","12 publicações por mês, incluindo Reels editados","Stories semanais com roteiro","Gestão de Instagram e Facebook","Página de links ou landing page personalizada","Formulário de captação integrado ao funil de leads (CRM)","Reunião mensal de resultados e ajustes"]',
 false, 'Quero o Prata', 20, 'published'),
('pacote-rb', 'Ouro', 'Vendas e automação: conteúdo que atrai, processos que convertem', null, 'mensal',
 '["Tudo do plano Prata","16 publicações por mês + stories","Fluxos de automação no Instagram (ex.: “comente e receba”) com ManyChat","Site institucional ou comercial completo, com painel para editar","E-mail marketing: base de contatos e 1 campanha mensal","Gestão de tráfego pago no Meta Ads (Facebook e Instagram)","Painel de leads, origem dos contatos e relatórios de conversão"]',
 true, 'Quero o Ouro', 30, 'published'),
('pacote-rb', 'Ultra Diamante', 'Ecossistema digital completo para quem quer escala', null, 'mensal',
 '["Tudo do plano Ouro","Volume de conteúdo sob medida, definido no planejamento","Sistema SaaS de agendamento ou gestão com a sua marca","Chatbot com IA no site, treinado com as informações da sua empresa","Automações comerciais e integrações (WhatsApp, CRM e e-mail)","Campanhas de e-mail segmentadas por público","Reuniões quinzenais e atendimento prioritário"]',
 false, 'Falar sobre o Ultra Diamante', 40, 'published');

-- Perguntas frequentes: nova versão completa
delete from public.faqs where true;
insert into public.faqs (question, answer, category, sort_order, show_on_home, status) values
('Por que contratar uma assessoria em vez de postar por conta própria?', 'Porque presença digital que gera resultado exige estratégia, constância e análise, além de tempo. A RB planeja o que publicar, produz com padrão profissional, acompanha os números e ajusta o rumo, enquanto você foca no seu negócio.', 'redes', 10, true, 'published'),
('Vocês fazem gestão completa do Instagram?', 'Sim. Do planejamento e calendário editorial à criação das artes, legendas, Reels, stories e relatórios. A quantidade de publicações varia conforme o plano escolhido.', 'redes', 20, true, 'published'),
('Vocês garantem número de seguidores ou de vendas?', 'Não prometemos números, porque eles dependem de fatores como mercado, oferta, investimento e atendimento. O que garantimos é método: estratégia, consistência e análise de dados para aumentar as chances de a sua marca ser encontrada, lembrada e escolhida.', 'redes', 30, true, 'published'),
('Quanto tempo leva para ver resultado nas redes sociais?', 'Os primeiros sinais, como alcance, interações e visitas ao perfil, costumam aparecer nas primeiras semanas de constância. Resultados de negócio, como contatos e vendas, são construídos ao longo dos meses, com ajustes mensais baseados nos números.', 'redes', 40, false, 'published'),
('Eu preciso gravar vídeos ou aparecer?', 'Não é obrigatório, mas aparecer gera mais conexão e confiança. Orientamos roteiros simples, ajudamos na gravação e cuidamos da edição. Também é possível trabalhar com conteúdo sem rosto, a partir de artes, bastidores e imagens do seu trabalho.', 'redes', 50, false, 'published'),
('Como as redes sociais ajudam a vender?', 'Conteúdo atrai e educa o público; chamadas para ação, landing pages e automações levam o interessado ao contato; o funil de leads organiza o atendimento até a venda. Nos planos com automação, quem comenta ou chama no Direct já é qualificado e encaminhado para você.', 'vendas', 60, true, 'published'),
('Vocês fazem tráfego pago (anúncios)?', 'Sim, a partir do plano Ouro: planejamento, criação dos anúncios, segmentação, acompanhamento e otimização no Meta Ads (Facebook e Instagram). A verba dos anúncios é paga diretamente pelo cliente à plataforma.', 'vendas', 70, true, 'published'),
('Como sei de onde vêm meus clientes?', 'Cada contato que chega pelo site é registrado com a origem (Instagram, anúncio, Google, indicação) e a campanha. Assim você enxerga quais ações trazem resultado e onde vale investir mais.', 'vendas', 80, false, 'published'),
('O que é e-mail marketing e como funciona com a RB?', 'É a comunicação por e-mail com quem autorizou receber seus conteúdos. Organizamos a base de contatos captados no site, criamos campanhas e acompanhamos aberturas e cliques, sempre com link de descadastro e respeitando a LGPD.', 'vendas', 90, false, 'published'),
('Vocês criam sites e landing pages?', 'Sim: sites institucionais, comerciais, portfólios, landing pages de campanha e sites oficiais para clubes e escolinhas de futebol. Todos responsivos, otimizados para o Google e integrados ao WhatsApp e às redes sociais.', 'sites', 100, true, 'published'),
('Vou conseguir atualizar o site sozinho?', 'Sim, quando o projeto inclui painel administrativo. Você edita textos, imagens, serviços e outros conteúdos sem precisar de programação, e as mudanças entram no ar na hora.', 'sites', 110, false, 'published'),
('O que é o sistema SaaS de agendamento?', 'É uma plataforma online com a sua marca para os clientes agendarem serviços sem troca de mensagens. Inclui gestão de serviços, clientes, horários e profissionais, além de recursos financeiros conforme o plano.', 'saas', 120, true, 'published'),
('O sistema funciona no celular?', 'Sim. Tanto a página de agendamento do seu cliente quanto a área de gestão funcionam no celular, no tablet e no computador.', 'saas', 130, false, 'published'),
('A automação substitui o atendimento humano?', 'Não. A automação responde dúvidas iniciais, coleta informações e organiza os contatos a qualquer hora, mas o relacionamento e as decisões continuam com pessoas. Casos que precisam de você são encaminhados automaticamente.', 'automacao', 140, false, 'published'),
('O chatbot com inteligência artificial pode errar?', 'Ele responde com base nas informações oficiais da sua empresa e é orientado a não inventar preços ou promessas. Mesmo assim, toda IA pode errar: por isso acompanhamos as conversas, corrigimos respostas e encaminhamos para atendimento humano quando necessário.', 'automacao', 150, false, 'published'),
('As ferramentas de automação estão incluídas no valor?', 'O serviço de criação e gestão dos fluxos está incluído no plano. Licenças de ferramentas de terceiros, como ManyChat ou a API oficial do WhatsApp, são contratadas e pagas separadamente pelo cliente.', 'automacao', 160, false, 'published'),
('Como funcionam os planos Bronze, Prata, Ouro e Ultra Diamante?', 'Cada plano soma recursos ao anterior: o Bronze organiza a presença nas redes, o Prata acelera com vídeo e captação, o Ouro integra vendas, site, e-mail e anúncios, e o Ultra Diamante entrega o ecossistema completo com sistema próprio e IA. Veja os detalhes na página de planos.', 'planos', 170, true, 'published'),
('Posso mudar de plano depois?', 'Sim. Os planos podem ser ajustados conforme a sua marca cresce ou o momento muda. As condições são definidas na proposta.', 'planos', 180, false, 'published'),
('Vocês atendem fora de Belo Horizonte?', 'Sim. A RB fica em Belo Horizonte/MG e atende clientes de todo o Brasil de forma remota, com reuniões online e comunicação próxima durante todo o projeto.', 'geral', 190, false, 'published'),
('Como funciona o início do trabalho?', 'Começamos com uma conversa de diagnóstico para entender sua marca, seu público, seus objetivos e seus canais. Em seguida, enviamos uma proposta com plano, entregas e investimento. Aprovada a proposta, o primeiro mês já começa com planejamento.', 'geral', 200, true, 'published'),
('Vocês usam inteligência artificial na produção de conteúdo?', 'Usamos IA como apoio em etapas como pesquisa e rascunhos, sempre com revisão e criação humana antes de qualquer publicação.', 'geral', 210, false, 'published');

-- Base de conhecimento do chatbot: planos e FAQ
insert into public.knowledge_items (title, content, category) values
('Planos da RB', 'Planos mensais: Bronze (presença essencial: 1 rede social, 8 publicações/mês, calendário editorial, relatório mensal), Prata (tudo do Bronze + 12 publicações/mês com Reels, stories, Instagram e Facebook, landing page ou página de links, captação integrada ao CRM, reunião mensal), Ouro (tudo do Prata + 16 publicações/mês, automação no Instagram com ManyChat, site completo com painel, e-mail marketing com 1 campanha mensal, gestão de tráfego no Meta Ads, relatórios de conversão) e Ultra Diamante (tudo do Ouro + conteúdo sob medida, sistema SaaS de agendamento ou gestão, chatbot com IA no site, automações e integrações com WhatsApp/CRM/e-mail, campanhas segmentadas, reuniões quinzenais e atendimento prioritário). Valores sob consulta, definidos após diagnóstico. Licenças de terceiros e verba de anúncios são pagas à parte.', 'precos'),
('Resultados e prazos', 'A RB não promete números de seguidores ou vendas. Primeiros sinais (alcance, interações) costumam aparecer nas primeiras semanas de constância; resultados de negócio são construídos ao longo dos meses com ajustes mensais.', 'politicas');
