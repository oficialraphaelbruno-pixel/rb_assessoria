-- =====================================================================
-- Conteúdo inicial. Textos institucionais vêm da Apresentação Comercial
-- da RB. Clientes/cases entram como RASCUNHO (status='draft') e só
-- aparecem no site depois de publicados pelo painel.
-- Planos SaaS entram como rascunho e sem preço ("sob consulta").
-- =====================================================================

insert into public.site_settings (key, label, draft, published)
select key, label, v::jsonb, v::jsonb from (values
('brand', 'Marca', $j${
  "name": "RB Assessoria & Comunicação",
  "short_name": "RB Assessoria",
  "tagline": "Comunicação com estratégia. Conteúdo com direção.",
  "logo_url": "/brand/logo-rb.png",
  "logo_alt": "RB Assessoria & Comunicação"
}$j$),
('hero', 'Página inicial — topo', $j${
  "eyebrow": "Marketing, comunicação e tecnologia",
  "title": "Comunicação com estratégia. Conteúdo com direção.",
  "subtitle": "Posicionamento, criação, sites, sistemas e automação para marcas, profissionais e projetos esportivos que querem crescer com consistência.",
  "primary_cta_label": "Solicitar orçamento",
  "primary_cta_href": "/contato",
  "secondary_cta_label": "Conhecer os serviços",
  "secondary_cta_href": "/servicos",
  "image_url": ""
}$j$),
('about', 'Sobre a RB', $j${
  "eyebrow": "Sobre a RB",
  "title": "A RB transforma presença digital em comunicação organizada",
  "text": "A RB Assessoria & Comunicação une planejamento, design, conteúdo, edição de vídeo, desenvolvimento e automação para ajudar profissionais, negócios locais e projetos esportivos a comunicar melhor, fortalecer sua autoridade e criar novas oportunidades.",
  "pillars": ["Estratégia antes da publicação.", "Consistência durante o processo.", "Análise para continuar evoluindo."]
}$j$),
('challenge', 'O desafio', $j${
  "eyebrow": "O desafio",
  "title": "Quando a comunicação não tem direção, boas oportunidades se perdem",
  "items": [
    "Perfil sem posicionamento claro.",
    "Conteúdo irregular ou sem planejamento.",
    "Identidade visual que muda a cada publicação.",
    "Vídeos sem edição e chamadas para ação.",
    "Informações importantes difíceis de encontrar.",
    "Interessados que comentam ou enviam mensagem, mas não avançam no atendimento."
  ],
  "closing": "A RB organiza estratégia, produção e acompanhamento para que cada conteúdo tenha uma função."
}$j$),
('process', 'Como trabalhamos', $j${
  "eyebrow": "Como trabalhamos",
  "title": "Um processo simples para manter consistência e evolução",
  "steps": [
    {"title": "Diagnóstico", "text": "Entender marca, público, objetivos e canais."},
    {"title": "Estratégia", "text": "Definir posicionamento, temas, formatos e prioridades."},
    {"title": "Produção", "text": "Criar textos, artes, vídeos, páginas e campanhas."},
    {"title": "Publicação e alinhamento", "text": "Organizar calendário e manter comunicação com o cliente."},
    {"title": "Análise e otimização", "text": "Acompanhar métricas, identificar aprendizados e ajustar o planejamento."}
  ]
}$j$),
('differentials', 'Diferenciais', $j${
  "eyebrow": "Diferenciais",
  "title": "Por que trabalhar com a RB",
  "items": [
    {"title": "Atendimento próximo", "text": "Atendimento próximo e personalizado, com quem conhece a sua realidade.", "icon": "handshake"},
    {"title": "Dados com olhar humano", "text": "Decisões orientadas por dados, sem abandonar o olhar humano.", "icon": "chart"},
    {"title": "Experiência em segmentos diferentes", "text": "Experiência com futebol de base, marcas pessoais e negócios locais.", "icon": "trophy"},
    {"title": "Tudo integrado", "text": "Integração entre conteúdo, design, vídeo, sites, sistemas e automação.", "icon": "layers"}
  ]
}$j$),
('saas', 'Soluções SaaS (home)', $j${
  "eyebrow": "Soluções SaaS",
  "title": "Sistemas próprios para organizar o seu atendimento",
  "text": "Desenvolvemos sistemas de agendamento online com página personalizada, gestão de serviços, clientes, horários e profissionais. Os recursos variam conforme o plano contratado.",
  "cta_label": "Conhecer os sistemas",
  "cta_href": "/servicos/sistemas-saas"
}$j$),
('cta_final', 'Chamada final', $j${
  "title": "Sua marca não precisa apenas aparecer. Precisa comunicar com direção.",
  "text": "Vamos entender o seu momento, identificar oportunidades e construir uma comunicação coerente com os seus objetivos.",
  "button_label": "Agende uma conversa de diagnóstico"
}$j$),
('founder', 'Quem está por trás da RB', $j${
  "eyebrow": "Quem está por trás da RB",
  "headline": "Por trás da RB, existe alguém que acredita no poder da boa comunicação",
  "name": "Raphael Bruno",
  "role": "Fundador",
  "photo_url": "/brand/fundador.webp",
  "photo_alt": "Raphael Bruno, fundador da RB Assessoria & Comunicação",
  "bio": [
    "Meu nome é Raphael Bruno. Sou belo-horizontino por escolha e de coração, apaixonado por marketing, comunicação e esportes. Foi nessa combinação que encontrei meu propósito profissional: ajudar empresas, profissionais e projetos a traduzirem o valor do que fazem em uma presença digital mais clara, profissional e próxima do público.",
    "Gosto de mergulhar na realidade de cada cliente, organizar ideias e transformar objetivos em conteúdo com direção. Mais do que deixar um perfil bonito, quero contribuir para que cada marca seja compreendida, lembrada e encontre novas oportunidades nas redes sociais."
  ],
  "quote": "Comunicar bem é fazer o público entender o valor que já existe na sua marca.",
  "experience": "",
  "specialties": [],
  "values": [],
  "vision": "",
  "instagram_url": "https://instagram.com/rb_assessoria.comunica",
  "linkedin_url": ""
}$j$),
('contact', 'Contato e redes', $j${
  "whatsapp_number": "5531982954000",
  "whatsapp_display": "(31) 98295-4000",
  "whatsapp_message": "Olá! Vim pelo site da RB e gostaria de conversar sobre um projeto.",
  "email": "oficial.raphaelbruno@gmail.com",
  "instagram_handle": "@rb_assessoria.comunica",
  "instagram_url": "https://instagram.com/rb_assessoria.comunica",
  "linkedin_url": "",
  "city": "Belo Horizonte/MG",
  "service_area": "Atendimento em todo o Brasil",
  "hours": ""
}$j$),
('seo', 'SEO global', $j${
  "site_url": "https://rbassessoria.com.br",
  "title": "RB Assessoria & Comunicação | Marketing, sites e sistemas",
  "title_template": "%s | RB Assessoria & Comunicação",
  "description": "Social media, criação de conteúdo, identidade visual, sites, sistemas de agendamento e automações com IA para marcas, profissionais e projetos esportivos.",
  "og_image": "",
  "keywords": "social media, marketing digital, criação de sites, landing page, sistema de agendamento, automação, Belo Horizonte"
}$j$),
('analytics', 'Analytics e verificação', $j${
  "ga4_id": "",
  "meta_pixel_id": "",
  "google_site_verification": ""
}$j$),
('home_sections', 'Seções da página inicial', $j${
  "challenge": true, "services": true, "differentials": true, "process": true,
  "portfolio": true, "clients": true, "saas": true, "about": true, "faq": true, "contact": true
}$j$),
('clubs', 'Página Clubes & Escolinhas', $j${
  "eyebrow": "Clubes, equipes e escolinhas",
  "title": "O site oficial que a sua equipe merece",
  "subtitle": "Sites profissionais para clubes, equipes e escolinhas de futebol que querem apresentar sua história, suas categorias e seus parceiros com organização e credibilidade.",
  "benefits": [
    {"title": "Site oficial da equipe", "text": "Um endereço próprio, com a identidade do clube, acessível no celular e no computador."},
    {"title": "História e apresentação institucional", "text": "Trajetória, valores, comissão técnica e estrutura em um só lugar."},
    {"title": "Categorias de base", "text": "Informações organizadas por categoria, com horários e formas de contato."},
    {"title": "Calendário de competições", "text": "Jogos, campeonatos e eventos sempre atualizados."},
    {"title": "Notícias e galerias", "text": "Espaço para resultados, bastidores, fotos e conquistas."},
    {"title": "Patrocinadores em destaque", "text": "Uma vitrine profissional para valorizar quem apoia o projeto."},
    {"title": "Formulários de interesse", "text": "Inscrições para peneiras, matrículas e contatos de pais e atletas."},
    {"title": "Divulgação de projetos", "text": "Apresentação de projetos sociais e esportivos para parceiros e apoiadores."}
  ],
  "closing": "Mais profissionalização na presença digital ajuda a equipe a ser encontrada, compreendida e lembrada.",
  "cta_label": "Solicitar orçamento para minha equipe"
}$j$),
('privacy', 'Política de privacidade', $j${
  "updated_at": "2026-11-21",
  "controller": "RB Assessoria & Comunicação",
  "contact_email": "oficial.raphaelbruno@gmail.com",
  "body": "## Quais dados coletamos\nQuando você preenche o formulário de orçamento ou conversa com o assistente virtual, coletamos os dados que você informa: nome, empresa, e-mail, WhatsApp, serviço de interesse e mensagem. Também registramos dados técnicos mínimos (como a página de origem e um identificador anônimo de visitante) para segurança e prevenção de abuso.\n\n## Para que usamos\nUsamos esses dados exclusivamente para responder ao seu contato, preparar propostas comerciais e prestar o atendimento solicitado. Não vendemos nem compartilhamos seus dados para fins de marketing de terceiros.\n\n## Base legal\nO tratamento se baseia no seu consentimento e na execução de procedimentos preliminares a contrato solicitados por você (LGPD, art. 7º, I e V).\n\n## Assistente virtual (IA)\nAs mensagens enviadas ao assistente são processadas por um provedor de inteligência artificial contratado pela RB para gerar as respostas e ficam registradas para melhoria do atendimento. Não envie dados sensíveis pelo chat.\n\n## Armazenamento e segurança\nOs dados ficam armazenados em infraestrutura de nuvem com controle de acesso restrito à equipe da RB. Adotamos medidas técnicas razoáveis de proteção, mas nenhum sistema é totalmente imune a incidentes.\n\n## Seus direitos\nVocê pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados e revogar o consentimento a qualquer momento pelo e-mail de contato abaixo.\n\n## Retenção\nMantemos os dados pelo tempo necessário ao atendimento e às obrigações legais. Contatos que não evoluírem para contratação podem ser excluídos mediante solicitação."
}$j$)
) as t(key, label, v)
on conflict (key) do nothing;

-- Serviços ----------------------------------------------------------------
insert into public.services (slug, title, eyebrow, summary, description, features, deliverables, icon, cta_label, seo_title, seo_description, sort_order, status, has_page) values
('social-media', 'Social Media e Marketing Digital', 'Estratégia e conteúdo',
 'Planejamento, criação e gestão das redes sociais com posicionamento claro e calendário editorial.',
 'Investir em redes sociais não é apenas publicar. É construir presença, confiança e oportunidades todos os dias. A RB cuida do planejamento à análise para que cada conteúdo tenha uma função dentro da estratégia da sua marca.',
 $j$[
  {"title": "Planejamento de conteúdo", "text": "Temas, formatos e prioridades definidos a partir dos objetivos da marca e do público."},
  {"title": "Criação de artes", "text": "Posts, carrosséis, Stories e campanhas com identidade visual consistente."},
  {"title": "Identidade visual", "text": "Padrões visuais que tornam a marca reconhecível em cada publicação."},
  {"title": "Gestão de Instagram", "text": "Organização do perfil, publicações, legendas, copy e chamadas para ação."},
  {"title": "Estratégias de comunicação", "text": "Mensagens alinhadas ao momento da marca e aos canais certos."},
  {"title": "Posicionamento digital", "text": "Marcas pessoais e negócios comunicando com clareza o valor do que fazem."},
  {"title": "Calendário editorial", "text": "Rotina de publicações organizada e acordada com o cliente."},
  {"title": "Relatórios e leitura de desempenho", "text": "Acompanhamento de métricas para ajustar o planejamento."}
 ]$j$,
 $j$["Planejamento estratégico de conteúdo","Design para posts, carrosséis, Stories e campanhas","Legendas, copy e chamadas para ação","Edição básica de vídeos e Reels","Calendário editorial","Relatórios de desempenho","Produção com apoio de IA, sempre com revisão humana"]$j$,
 'megaphone', 'Quero organizar minhas redes',
 'Social Media e Marketing Digital', 'Planejamento de conteúdo, criação de artes, gestão de Instagram e calendário editorial com estratégia.', 10, 'published', true),

('sites', 'Desenvolvimento de Sites', 'Sites e landing pages',
 'Sites institucionais, comerciais, landing pages e portfólios rápidos, responsivos e prontos para converter.',
 'Um site profissional reúne as informações mais importantes da sua marca em um endereço próprio, fácil de encontrar e de navegar. Desenvolvemos páginas pensadas para apresentar bem o seu trabalho e transformar visitas em contatos.',
 $j$[
  {"title": "Sites institucionais", "text": "Apresentação completa da empresa, serviços, história e contato."},
  {"title": "Sites comerciais", "text": "Páginas focadas em gerar orçamentos, pedidos e conversas."},
  {"title": "Landing pages", "text": "Páginas de campanha com um objetivo claro e chamada para ação."},
  {"title": "Portfólios", "text": "Vitrine organizada para trabalhos, projetos e resultados."},
  {"title": "Clubes e escolinhas de futebol", "text": "Site oficial com categorias, calendário, notícias e patrocinadores."},
  {"title": "Apresentação de patrocinadores", "text": "Páginas para valorizar parceiros e atrair novos apoiadores."},
  {"title": "Profissionais autônomos", "text": "Presença digital própria para quem vive do seu nome e da sua reputação."}
 ]$j$,
 $j$["Layout responsivo (celular, tablet e computador)","Otimização para buscadores (SEO técnico)","Formulários de contato integrados","Integração com WhatsApp e redes sociais","Painel para atualização de conteúdo, quando contratado"]$j$,
 'monitor', 'Quero um site profissional',
 'Desenvolvimento de Sites e Landing Pages', 'Sites institucionais, comerciais, landing pages, portfólios e sites para clubes e escolinhas de futebol.', 20, 'published', true),

('sistemas-saas', 'Sistemas SaaS', 'Agendamento online',
 'Sistemas de agendamento online com página personalizada e gestão de serviços, clientes e horários.',
 'Para quem atende com hora marcada, organizar agenda, clientes e serviços faz diferença no dia a dia. A RB desenvolve sistemas de agendamento online com página personalizada para a sua marca e recursos que crescem conforme o plano contratado.',
 $j$[
  {"title": "Agendamento online", "text": "Seus clientes escolhem serviço, profissional e horário sem troca de mensagens."},
  {"title": "Página personalizada", "text": "Uma página com a identidade da sua marca para receber agendamentos."},
  {"title": "Gestão de serviços", "text": "Cadastro de serviços, duração e valores."},
  {"title": "Gestão de clientes", "text": "Histórico e informações de contato organizados."},
  {"title": "Controle de horários", "text": "Disponibilidade, bloqueios e intervalos configuráveis."},
  {"title": "Gestão de profissionais", "text": "Agendas individuais para cada profissional da equipe."},
  {"title": "Módulos financeiros", "text": "Acompanhamento de valores conforme o plano."},
  {"title": "Recursos adicionais", "text": "Funcionalidades extras de acordo com o plano contratado."}
 ]$j$,
 $j$[]$j$,
 'calendar', 'Quero um sistema de agendamento',
 'Sistema de Agendamento Online', 'Sistema de agendamento online com página personalizada, gestão de serviços, clientes, horários e profissionais.', 30, 'published', true),

('automacoes-ia', 'Automações e Inteligência Artificial', 'Atendimento e processos',
 'Chatbots, automação de atendimento, qualificação de leads e integrações para não perder oportunidades.',
 'O conteúdo abre a conversa. A automação ajuda a não perder oportunidades. Criamos fluxos que respondem dúvidas iniciais, qualificam contatos e encaminham para o atendimento humano no momento certo. A automação apoia o atendimento, mas não substitui o relacionamento humano.',
 $j$[
  {"title": "Automação de atendimento", "text": "Respostas iniciais a dúvidas frequentes, a qualquer hora."},
  {"title": "Chatbots", "text": "Assistentes para site, Instagram e WhatsApp com informações da sua empresa."},
  {"title": "Qualificação de leads", "text": "Coleta de nome, interesse e contexto antes do contato humano."},
  {"title": "Integração com sistemas", "text": "Conexão entre formulários, planilhas, CRM e outras ferramentas."},
  {"title": "Fluxos comerciais", "text": "Etapas organizadas do primeiro contato à proposta."},
  {"title": "Integrações com APIs", "text": "Comunicação entre plataformas para reduzir trabalho manual."},
  {"title": "Fluxos no Instagram com ManyChat", "text": "Ex.: “Comente PENEIRA para receber as informações.”"}
 ]$j$,
 $j$["Conteúdo ou campanha","Comentário ou Direct","Qualificação automatizada","Encaminhamento autorizado ao WhatsApp","Atendimento humano"]$j$,
 'bot', 'Quero automatizar meu atendimento',
 'Automações e Inteligência Artificial', 'Chatbots, automação de atendimento, qualificação de leads, fluxos comerciais e integrações com APIs.', 40, 'published', true),

('design-identidade-visual', 'Criação de Artes e Identidade Visual', 'Design',
 'Identidade visual, artes para redes sociais e materiais de comunicação com consistência.',
 'Uma identidade visual consistente faz a marca ser reconhecida antes mesmo de o nome aparecer. Criamos artes e padrões visuais que organizam a comunicação em todos os pontos de contato.',
 $j$[
  {"title": "Identidade visual", "text": "Cores, tipografia e elementos gráficos com coerência."},
  {"title": "Artes para redes sociais", "text": "Posts, carrosséis, Stories e capas."},
  {"title": "Materiais de campanha", "text": "Peças para lançamentos, eventos e ações sazonais."},
  {"title": "Apresentações comerciais", "text": "Materiais para apresentar a empresa a clientes e parceiros."}
 ]$j$,
 $j$[]$j$,
 'palette', 'Quero renovar minha identidade',
 'Criação de Artes e Identidade Visual', 'Identidade visual, artes para redes sociais, materiais de campanha e apresentações comerciais.', 50, 'published', true)
on conflict (slug) do nothing;

-- Planos SaaS (rascunho, sem preço) ---------------------------------------
insert into public.plans (name, tagline, price_cents, features, highlighted, sort_order, status) values
('Bronze', 'Para começar a receber agendamentos online', null, '["Página personalizada","Agendamento online","Gestão de serviços"]', false, 10, 'draft'),
('Prata', 'Para organizar clientes e horários', null, '["Tudo do Bronze","Gestão de clientes","Controle de horários"]', false, 20, 'draft'),
('Ouro', 'Para equipes com vários profissionais', null, '["Tudo do Prata","Gestão de profissionais","Relatórios"]', true, 30, 'draft'),
('Ultra Diamante', 'Para operações completas', null, '["Tudo do Ouro","Módulos financeiros","Recursos adicionais sob medida"]', false, 40, 'draft');

-- FAQ ------------------------------------------------------------------------
insert into public.faqs (question, answer, category, sort_order, status) values
('Vocês atendem fora de Belo Horizonte?', 'Sim. A RB fica em Belo Horizonte/MG e atende clientes de todo o Brasil de forma remota, com reuniões online e comunicação próxima durante todo o projeto.', 'geral', 10, 'published'),
('Como funciona o início do trabalho?', 'Começamos com uma conversa de diagnóstico para entender sua marca, seu público, seus objetivos e seus canais. A partir disso, apresentamos uma proposta com escopo, entregas e investimento.', 'geral', 20, 'published'),
('Quanto custa?', 'O investimento depende do escopo de cada projeto. Depois do diagnóstico, enviamos uma proposta personalizada. Você pode solicitar um orçamento sem compromisso pelo formulário.', 'precos', 30, 'published'),
('As ferramentas de automação estão incluídas no valor?', 'Licenças de ferramentas como ManyChat, chatbot para WhatsApp ou outras plataformas necessárias são contratadas e pagas separadamente pelo cliente. Fluxos adicionais e integrações complexas dependem de diagnóstico e orçamento específico.', 'automacao', 40, 'published'),
('A automação substitui o atendimento humano?', 'Não. A automação apoia o atendimento respondendo dúvidas iniciais e organizando contatos, mas o relacionamento e as decisões continuam com pessoas.', 'automacao', 50, 'published'),
('Vocês usam inteligência artificial na produção de conteúdo?', 'Usamos IA como apoio em etapas da produção, sempre com revisão humana antes de qualquer publicação.', 'conteudo', 60, 'published'),
('Vocês garantem número de seguidores ou vendas?', 'Não prometemos números. Trabalhamos com estratégia, consistência e análise de dados para aumentar as chances de a sua marca ser encontrada, compreendida e lembrada.', 'geral', 70, 'published');

-- Clientes & Projetos (RASCUNHO — publicar pelo painel após confirmação) ----
insert into public.portfolio_clients (slug, name, segment, category, summary, description, services, metrics, metrics_source, sort_order, status) values
('imef', 'IMEF Futebol de Base', 'Futebol de base e eventos esportivos', 'esporte',
 'Uma vitrine relevante do futebol de base mineiro.',
 'O conteúdo ampliou a exposição da marca, fortaleceu sua comunidade e estimulou ações dentro e fora do perfil.',
 '["Social Media","Criação de conteúdo","Edição de vídeo"]',
 '[{"value":"2,9 milhões","label":"visualizações"},{"value":"229,2 mil","label":"contas alcançadas"},{"value":"41,7 mil","label":"interações"},{"value":"59,3 mil","label":"visitas ao perfil"},{"value":"+4,7 mil","label":"novos seguidores"},{"value":"+1 mil","label":"cliques no link"}]',
 'Dados do Instagram da IMEF, fornecidos pela RB — janeiro a junho de 2026.', 10, 'draft'),
('samuel-do-carmo', 'Samuel do Carmo', 'Autoridade e marca pessoal no esporte', 'marca-pessoal',
 'Autoridade que ganhou alcance e ação.',
 'Mais visibilidade fortaleceu a presença de Samuel como treinador e ampliou os caminhos para o público conhecer seu trabalho.',
 '["Social Media","Posicionamento de marca pessoal"]',
 '[{"value":"617,7 mil","label":"visualizações em seis meses"},{"value":"252,4 mil","label":"contas alcançadas no Instagram"},{"value":"23,7 mil","label":"interações no Instagram"},{"value":"1.520","label":"cliques no link"}]',
 'Meta Business Suite — 1º semestre de 2026.', 20, 'draft'),
('manu-aguilar-fotografia', 'Manu Aguilar Fotografia', 'Fotografia esportiva', 'marca-pessoal',
 'Presença e autoridade para quem vive o esporte.',
 'O conteúdo ampliou a visibilidade do trabalho da Manu e ajudou a transformar sua experiência em fotografia esportiva em presença, conexão e autoridade digital.',
 '["Social Media"]',
 '[{"value":"287,4 mil","label":"visualizações"},{"value":"+37 mil","label":"interações"},{"value":"+3,3 mil","label":"visitas ao perfil"},{"value":"435","label":"novos seguidores"}]',
 'Dados do perfil fornecidos pela RB — 1º semestre de 2026.', 30, 'draft'),
('julia-santos-epil', 'Júlia Santos Epil', 'Estética e serviço local', 'negocio-local',
 'Visibilidade para um serviço local.',
 'Uma comunicação mais presente e organizada ampliou a descoberta do perfil e fortaleceu o contato do público com o serviço.',
 '["Social Media","Sistema de agendamento"]',
 '[{"value":"1,282 milhão","label":"visualizações no Instagram profissional"},{"value":"+548 mil","label":"contas alcançadas"},{"value":"37.870","label":"interações"},{"value":"5.880","label":"novos seguidores"}]',
 'Dados do perfil fornecidos pela RB.', 40, 'draft')
on conflict (slug) do nothing;

-- Financeiro: categorias padrão ----------------------------------------------
insert into public.fin_categories (name, kind) values
('Mensalidade de clientes','receita'),('Projeto avulso','receita'),('Sistema SaaS','receita'),('Outras receitas','receita'),
('Ferramentas e softwares','despesa'),('Hospedagem e domínio','despesa'),('Impostos','despesa'),('Marketing e anúncios','despesa'),
('Equipamentos','despesa'),('Terceiros e freelancers','despesa'),('Transporte','despesa'),('Outras despesas','despesa')
on conflict do nothing;

-- Chatbot: configuração (desligado até haver chave de API) -------------------
insert into public.chat_settings (id, rules) values (1,
'- Responda apenas sobre a RB Assessoria & Comunicação, seus serviços e como contratar.
- Nunca invente preços, prazos, resultados ou clientes. Se não houver a informação na base, diga que a equipe confirma no orçamento.
- Não prometa resultados (seguidores, vendas, posições no Google).
- Quando a pessoa demonstrar interesse em contratar, convide-a a deixar nome, WhatsApp ou e-mail (com consentimento) ou a usar o formulário de orçamento.
- Se a pessoa pedir para falar com uma pessoa, reclamar, negociar valores ou tratar de contrato, encaminhe para atendimento humano.')
on conflict (id) do nothing;

-- Base de conhecimento inicial ----------------------------------------------
insert into public.knowledge_items (title, content, category) values
('Sobre a RB', 'A RB Assessoria & Comunicação fica em Belo Horizonte/MG e atende todo o Brasil. Une planejamento, design, conteúdo, edição de vídeo, desenvolvimento de sites e sistemas e automação para ajudar profissionais, negócios locais e projetos esportivos a comunicar melhor, fortalecer sua autoridade e criar novas oportunidades. Fundador e responsável: Raphael Bruno.', 'empresa'),
('Serviços oferecidos', 'Gestão de redes sociais e social media; planejamento estratégico de conteúdo; criação de artes e identidade visual; desenvolvimento de sites institucionais, comerciais, portfólios e landing pages; sites para clubes e escolinhas de futebol; sistemas SaaS de agendamento online; automações comerciais (ManyChat, WhatsApp); chatbots e integrações com inteligência artificial; soluções digitais personalizadas.', 'servicos'),
('Como trabalhamos', 'Processo em 5 etapas: 1) Diagnóstico — entender marca, público, objetivos e canais; 2) Estratégia — posicionamento, temas, formatos e prioridades; 3) Produção — textos, artes, vídeos e campanhas; 4) Publicação e alinhamento — calendário e comunicação com o cliente; 5) Análise e otimização — métricas, aprendizados e ajustes.', 'empresa'),
('Preços e orçamento', 'A RB não trabalha com tabela fixa publicada: o investimento depende do escopo. O caminho é uma conversa de diagnóstico seguida de proposta personalizada. Licenças de ferramentas (ManyChat, chatbot para WhatsApp etc.) são pagas separadamente pelo cliente. Planos do sistema de agendamento (Bronze, Prata, Ouro e Ultra Diamante) têm valores informados no orçamento.', 'precos'),
('Sistema de agendamento', 'Sistema SaaS de agendamento online com página personalizada, gestão de serviços, clientes, horários e profissionais e módulos financeiros. Recursos variam conforme o plano: Bronze, Prata, Ouro e Ultra Diamante.', 'servicos'),
('Contato', 'WhatsApp: (31) 98295-4000. Instagram: @rb_assessoria.comunica. Também é possível solicitar orçamento pelo formulário na página de contato do site.', 'empresa'),
('Uso de IA na produção', 'A RB usa inteligência artificial como apoio na produção de conteúdo, sempre com revisão humana. A automação apoia o atendimento, mas não substitui o relacionamento humano.', 'politicas');

insert into public.integrations (key, name, notes) values
('manychat', 'ManyChat', 'Receber leads via webhook (/api/webhooks/leads). Requer conta ManyChat (paga pelo cliente/RB).'),
('whatsapp', 'WhatsApp Business Platform', 'Meta Cloud API. Requer número verificado e aprovação da Meta.'),
('instagram', 'Instagram', 'Via Meta Graph API ou ManyChat.'),
('meta_ads', 'Meta Ads', 'Pixel configurado em Analytics; leads de formulários via webhook.'),
('google_ads', 'Google Ads', 'Conversões via GA4/gtag; UTMs registrados em cada lead.'),
('email_marketing', 'E-mail marketing', 'Resend (transacional) já suportado; campanhas a definir.')
on conflict (key) do nothing;
