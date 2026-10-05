-- ====================================================================
-- SEED DE MÍDIAS REAIS DO GOOGLE DRIVE - DK REVESTIMENTOS
-- Pasta de Origem: 1JLgy4CgzARc2ahcvUHJ7fiBrTQWjt7F5
-- ====================================================================

-- 1. Garante que as colunas de proporção e Google Drive existam
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS proporcao TEXT DEFAULT 'horizontal';
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS gdrive_id TEXT;

-- 2. Insere ou atualiza os 16 projetos com links diretos do Google Drive
INSERT INTO public.portfolio (id, tipo_midia, proporcao, gdrive_id, titulo, categoria, descricao, midia_url, poster_url, created_at)
VALUES
(1, 'video', 'vertical', '1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS', 'Tour em Vídeo: Ambiente Planejado Sob Medida', 'Marcenaria Sob Medida', 'Vídeo vertical destacando acabamento refinado, aproveitamento inteligente de espaço e iluminação integrada.', 'https://drive.google.com/file/d/1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS/preview', 'assets/portfolio/poster_VID-20261004-WA0053.jpg', NOW()),
(2, 'video', 'vertical', '1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv', 'Painel e Revestimento em Madeira Nobre', 'Painéis & Revestimentos', 'Marcenaria de alto padrão com revestimento ripado, alinhamento milimétrico e sistema de passagem oculta.', 'https://drive.google.com/file/d/1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv/preview', 'assets/portfolio/poster_VID-20261004-WA0024.jpg', NOW()),
(3, 'video', 'horizontal', '14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ', 'Tour Panorâmico: Mobiliário Sob Medida', 'Marcenaria Sob Medida', 'Visão panorâmica em vídeo demonstrando fluidez espacial, nichos sob medida e armários planejados.', 'https://drive.google.com/file/d/14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ/preview', 'assets/portfolio/poster_VID-20261004-WA0021.jpg', NOW()),
(4, 'video', 'vertical', '1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_', 'Detalhamento e Acabamento de Marcenaria Fina', 'Marcenaria Sob Medida', 'Demonstração prática de corrediças ocultas, amortecimento suave e encaixes de alta precisão.', 'https://drive.google.com/file/d/1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_/preview', 'assets/portfolio/poster_VID-20261004-WA0022.jpg', NOW()),
(5, 'video', 'horizontal', '1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe', 'Portão e Painel em Madeira para Área Externa', 'Áreas Externas', 'Estrutura ripada em madeira maciça com tratamento para intempéries e acabamento refinado para áreas abertas.', 'https://drive.google.com/file/d/1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe/preview', 'assets/portfolio/poster_VID-20261004-WA0023.jpg', NOW()),
(6, 'video', 'horizontal', '1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs', 'Projeto em Madeira para Área Externa', 'Áreas Externas', 'Execução completa de marcenaria externa em madeira nobre tratada, unindo resistência e estética natural.', 'https://drive.google.com/file/d/1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs/preview', 'assets/portfolio/IMG-20261004-WA0006.jpg', NOW()),
(7, 'foto', 'vertical', '1vD0o54VW9e0CoLFHr4NxvEqF5c3qmfs2', 'Deck e Estrutura em Madeira Maciça', 'Áreas Externas', 'Projeto externo com réguas selecionadas de madeira nobre e acabamento protetor acetinado.', 'assets/portfolio/IMG-20261004-WA0006.jpg', 'assets/portfolio/IMG-20261004-WA0006.jpg', NOW()),
(8, 'foto', 'horizontal', '18koAp3WQPfUI7-XGCsTJnkNdT3ag-n8j', 'Mobiliário Planejado para Sala de Estar', 'Salas & Livings', 'Linhas limpas, marcenaria sob medida e harmonização de texturas para ambientes integrados.', 'assets/portfolio/IMG-20261004-WA0013.jpg', 'assets/portfolio/IMG-20261004-WA0013.jpg', NOW()),
(9, 'foto', 'horizontal', '1p3Sr741KCf6hhjLtQy7OwzNSg6RkbX4f', 'Bancada e Armários com Cava Integrada', 'Salas & Livings', 'Mobiliário autoral com acabamento fosco e puxadores esculpidos na própria madeira.', 'assets/portfolio/IMG-20261004-WA0014.jpg', 'assets/portfolio/IMG-20261004-WA0014.jpg', NOW()),
(10, 'foto', 'vertical', '19ExhkajsWto9piV8CBPzWXUkpnop4UcN', 'Armário Planejado com Portas Deslizantes', 'Dormitórios & Closets', 'Marcenaria vertical com divisão funcional e esquadrias de alumínio para deslizamento silencioso.', 'assets/portfolio/IMG-20261004-WA0015.jpg', 'assets/portfolio/IMG-20261004-WA0015.jpg', NOW()),
(11, 'foto', 'vertical', '1QcLIs0It9t7nfIF7UfpcfGDHIXg7bp6u', 'Módulo Sob Medida com Nichos Decorativos', 'Marcenaria Sob Medida', 'Mobiliário planejado com nichos e encaixes precisos para organização de eletros e decoração.', 'assets/portfolio/IMG-20261004-WA0016.jpg', 'assets/portfolio/IMG-20261004-WA0016.jpg', NOW()),
(12, 'foto', 'horizontal', '1vRcS5p-vUlI8gA0JD0hHSV_MHLbN-D61', 'Espaço Gourmet com Marcenaria Exclusiva', 'Cozinhas & Gourmet', 'Bancadas planejadas e gabinetes sob medida projetados para funcionalidade e durabilidade.', 'assets/portfolio/IMG-20261004-WA0017.jpg', 'assets/portfolio/IMG-20261004-WA0017.jpg', NOW()),
(13, 'foto', 'horizontal', '1lbzwv1kntpKbitrPzRBWaCNNQuMqH57m', 'Estante e Painel com Prateleiras Flutuantes', 'Salas & Livings', 'Composição de prateleiras com fixação oculta e painel de fundo em lâmina natural.', 'assets/portfolio/IMG-20261004-WA0018.jpg', 'assets/portfolio/IMG-20261004-WA0018.jpg', NOW()),
(14, 'foto', 'vertical', '1K1hF4glYsmHyBz5YNhnNZ9SE9SsGhBN6', 'Oratório Artesanal em Madeira Ripada', 'Marcenaria Sob Medida', 'Peça sacra autoral esculpida em madeira nobre com laterais em detalhe ripado e visor frontal em vidro.', 'assets/portfolio/IMG-20261004-WA0019.jpg', 'assets/portfolio/IMG-20261004-WA0019.jpg', NOW()),
(15, 'foto', 'vertical', '1jpFzyrxbXQgHclrM0Zp0dCKWsmVNsrMX', 'Painel Decorativo com Porta Mimetizada', 'Painéis & Revestimentos', 'Solução arquitetônica contínua onde a passagem é camuflada nos frisos da marcenaria.', 'assets/portfolio/IMG-20261004-WA0020.jpg', 'assets/portfolio/IMG-20261004-WA0020.jpg', NOW()),
(16, 'foto', 'vertical', '18P3cPr_-pc8WOQ2jEdeYfjGUCXMwKg2o', 'Caderno Técnico de Detalhamento e Plantas', 'Marcenaria Sob Medida', 'Desenhos técnicos, cotas de marcenaria e especificações executivas de projetos sob medida.', 'assets/portfolio/Digitalizado_20261004-2113.pdf', 'assets/portfolio/pdf_page1.jpg', NOW())
ON CONFLICT (id) DO UPDATE SET 
  tipo_midia = EXCLUDED.tipo_midia,
  proporcao = EXCLUDED.proporcao,
  gdrive_id = EXCLUDED.gdrive_id,
  titulo = EXCLUDED.titulo,
  categoria = EXCLUDED.categoria,
  descricao = EXCLUDED.descricao,
  midia_url = EXCLUDED.midia_url,
  poster_url = EXCLUDED.poster_url;

-- Ajusta a sequence para novos IDs gerados automaticamente
SELECT setval('portfolio_id_seq', (SELECT MAX(id) FROM public.portfolio));
