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
(1, 'video', 'vertical', '1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS', 'Suíte Master com Armários Planejados e Iluminação LED', 'Dormitórios & Closets', 'Tour vertical mostrando divisão inteligente de espaço, gaveteiros com amortecedores e iluminação embutida em perfil de LED.', 'https://drive.google.com/file/d/1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS/preview', 'assets/portfolio/poster_VID-20261004-WA0053.jpg', NOW()),
(2, 'video', 'vertical', '1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv', 'Living Integrado com Painel Ripado e Portas de Passagem Ocultas', 'Painéis & Revestimentos', 'Execução de marcenaria de alto padrão com revestimento ripado em lâmina nobre, mimetizando portas de acesso com fechamento suave.', 'https://drive.google.com/file/d/1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv/preview', 'assets/portfolio/poster_VID-20261004-WA0024.jpg', NOW()),
(3, 'video', 'horizontal', '14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ', 'Tour Panorâmico: Cozinha Gourmet Planejada e Ilha Integrada', 'Cozinhas & Gourmet', 'Vídeo panorâmico completo destacando a amplitude do living gourmet, armários com abertura por toque e nichos para eletrodomésticos.', 'https://drive.google.com/file/d/14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ/preview', 'assets/portfolio/poster_VID-20261004-WA0021.jpg', NOW()),
(4, 'video', 'vertical', '1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_', 'Acabamento Fino: Corrediças Ocultas e Puxadores Cava', 'Salas & Livings', 'Demonstração prática da suavidade dos sistemas de gavetas alemãs, encaixes milimétricos e ausência de folgas nos armários.', 'https://drive.google.com/file/d/1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_/preview', 'assets/portfolio/poster_VID-20261004-WA0022.jpg', NOW()),
(5, 'video', 'horizontal', '1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe', 'Portão e Painel em Madeira para Área Externa', 'Áreas Externas', 'Estrutura e fechamento em réguas de madeira maciça tratada para área externa com acabamento refinado.', 'https://drive.google.com/file/d/1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe/preview', 'assets/portfolio/poster_VID-20261004-WA0023.jpg', NOW()),
(6, 'video', 'horizontal', '1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs', 'Deck Suspenso em Cumaru & Revestimentos de Área Externa', 'Áreas Externas', 'Projeto completo de deck em madeira maciça nobre Cumaru com iluminação paisagística e tratamento anti-intempéries.', 'https://drive.google.com/file/d/1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs/preview', 'assets/portfolio/IMG-20261004-WA0006.jpg', NOW()),
(7, 'foto', 'vertical', '1vD0o54VW9e0CoLFHr4NxvEqF5c3qmfs2', 'Deck Suspenso em Madeira Cumaru com Iluminação Embutida', 'Áreas Externas', 'Fotografia vertical destacando os balizadores de piso integrados e acabamento acetinado com proteção UV.', 'assets/portfolio/IMG-20261004-WA0006.jpg', 'assets/portfolio/IMG-20261004-WA0006.jpg', NOW()),
(8, 'foto', 'horizontal', '18koAp3WQPfUI7-XGCsTJnkNdT3ag-n8j', 'Living Integrado com Bancada e Painel Amplo de TV', 'Salas & Livings', 'Visão ampla horizontal mostrando a harmonia de marcenaria entre o painel e os armários inferiores com puxadores integrados.', 'assets/portfolio/IMG-20261004-WA0013.jpg', 'assets/portfolio/IMG-20261004-WA0013.jpg', NOW()),
(9, 'foto', 'horizontal', '1p3Sr741KCf6hhjLtQy7OwzNSg6RkbX4f', 'Mobiliário Planejado com Acabamento Acetinado e Cavas Cavas', 'Salas & Livings', 'Perspectiva de marcenaria minimalista com gavetões profundos e acabamento resistente a riscos.', 'assets/portfolio/IMG-20261004-WA0014.jpg', 'assets/portfolio/IMG-20261004-WA0014.jpg', NOW()),
(10, 'foto', 'vertical', '19ExhkajsWto9piV8CBPzWXUkpnop4UcN', 'Armário de Suíte com Portas Deslizantes e Espelho Bronze', 'Dormitórios & Closets', 'Fotografia vertical mostrando aproveitamento de pé-direito com armário embutido e portas com perfil de alumínio.', 'assets/portfolio/IMG-20261004-WA0015.jpg', 'assets/portfolio/IMG-20261004-WA0015.jpg', NOW()),
(11, 'foto', 'vertical', '1QcLIs0It9t7nfIF7UfpcfGDHIXg7bp6u', 'Torre Quente e Nichos Planejados sob Medida', 'Cozinhas & Gourmet', 'Módulo vertical para forno e micro-ondas embutidos com ventilação oculta e nichos decorativos.', 'assets/portfolio/IMG-20261004-WA0016.jpg', 'assets/portfolio/IMG-20261004-WA0016.jpg', NOW()),
(12, 'foto', 'horizontal', '1vRcS5p-vUlI8gA0JD0hHSV_MHLbN-D61', 'Espaço Gourmet com Ilha em Madeira Nobre e Granito', 'Cozinhas & Gourmet', 'Visão horizontal de bancada gourmet com marcenaria sob medida e gaveteiros térmicos.', 'assets/portfolio/IMG-20261004-WA0017.jpg', 'assets/portfolio/IMG-20261004-WA0017.jpg', NOW()),
(13, 'foto', 'horizontal', '1lbzwv1kntpKbitrPzRBWaCNNQuMqH57m', 'Home Office Planejado com Prateleiras Flutuantes Reforçadas', 'Salas & Livings', 'Prateleiras engastadas com fixação invisível suportando peso e mesa de trabalho ergonômica.', 'assets/portfolio/IMG-20261004-WA0018.jpg', 'assets/portfolio/IMG-20261004-WA0018.jpg', NOW()),
(14, 'foto', 'vertical', '1K1hF4glYsmHyBz5YNhnNZ9SE9SsGhBN6', 'Oratório Artesanal em Madeira Ripada', 'Marcenaria Sob Medida', 'Peça sacra autoral esculpida em madeira nobre com laterais em detalhe ripado e visor frontal em vidro.', 'assets/portfolio/IMG-20261004-WA0019.jpg', 'assets/portfolio/IMG-20261004-WA0019.jpg', NOW()),
(15, 'foto', 'vertical', '1jpFzyrxbXQgHclrM0Zp0dCKWsmVNsrMX', 'Porta Mimetizada em Painel com Encaixe Oculto', 'Painéis & Revestimentos', 'Fechamento contínuo onde a porta do lavabo se funde perfeitamente com os frisos do painel decorativo da sala.', 'assets/portfolio/IMG-20261004-WA0020.jpg', 'assets/portfolio/IMG-20261004-WA0020.jpg', NOW()),
(16, 'foto', 'vertical', '18P3cPr_-pc8WOQ2jEdeYfjGUCXMwKg2o', 'Caderno de Projetos & Desenhos Técnicos de Marcenaria', 'Marcenaria Sob Medida', 'Desenhos técnicos, detalhamento de cortes, cotas e especificações arquitetônicas dos móveis sob medida da DK Revestimentos.', 'assets/portfolio/Digitalizado_20261004-2113.pdf', 'assets/portfolio/pdf_page1.jpg', NOW())
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
