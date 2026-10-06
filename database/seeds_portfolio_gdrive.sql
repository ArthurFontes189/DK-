-- ====================================================================
-- SEED DE MÍDIAS REAIS DO GOOGLE DRIVE - DK REVESTIMENTOS
-- Categorias: MARCENARIA, MÓVEIS SOB MEDIDA, ÁREAS EXTERNAS, MADEIRA & REVESTIMENTOS, PROJETOS ESPECIAIS
-- ====================================================================

ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS proporcao TEXT DEFAULT 'horizontal';
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS gdrive_id TEXT;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS subtitulo TEXT;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT false;

INSERT INTO public.portfolio (id, tipo_midia, proporcao, gdrive_id, titulo, subtitulo, categoria, descricao, midia_url, poster_url, destaque, created_at)
VALUES
(1, 'video', 'vertical', '1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS', 'AMBIENTE PLANEJADO', 'Aproveitamento inteligente de espaço e marcenaria fina', 'MARCENARIA', 'Projeto e execução de ambiente sob medida com marcenaria integrada e iluminação embutida.', 'https://drive.google.com/file/d/1-RgNwqu-yqW4O7axmiJ4LZcirHDD5QaS/preview', 'assets/portfolio/poster_VID-20261004-WA0053.jpg', false, NOW()),
(2, 'video', 'vertical', '1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv', 'PAINEL RIPADO EM MADEIRA', 'Revestimento vertical ripado com passagem oculta', 'MADEIRA & REVESTIMENTOS', 'Revestimento ripado em madeira nobre com alinhamento milimétrico e porta de acesso mimetizada.', 'https://drive.google.com/file/d/1W-Wfu-bxrmqwkW8HfAsaOHDPqRW0zjkv/preview', 'assets/portfolio/poster_VID-20261004-WA0024.jpg', true, NOW()),
(3, 'video', 'horizontal', '14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ', 'MOBILIÁRIO SOB MEDIDA', 'Mobiliário personalizado para residência', 'MÓVEIS SOB MEDIDA', 'Composição de armários e bancadas desenhados para máxima fluidez e funcionalidade.', 'https://drive.google.com/file/d/14TPKO6E7hUDjcHqkw558chwjqZLSD5MJ/preview', 'assets/portfolio/poster_VID-20261004-WA0021.jpg', false, NOW()),
(4, 'video', 'vertical', '1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_', 'MARCENARIA DE ALTO PADRÃO', 'Acabamento refinado e precisão nos encaixes', 'MARCENARIA', 'Demonstração prática dos sistemas de abertura suave, gavetões reforçados e marcenaria de precisão.', 'https://drive.google.com/file/d/1dML6s-wxahq_tJtpFw0XHM8QXFewdHn_/preview', 'assets/portfolio/poster_VID-20261004-WA0022.jpg', false, NOW()),
(5, 'video', 'horizontal', '1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe', 'PORTÃO E PAINEL EM MADEIRA', 'Fechamento em réguas de madeira maciça tratada', 'ÁREAS EXTERNAS', 'Estrutura robusta e elegante em madeira tratada contra intempéries com fechamento artesanal.', 'https://drive.google.com/file/d/1eyvDs5Q7en3ilnhku_Mt3PzDYOc0VnFe/preview', 'assets/portfolio/poster_VID-20261004-WA0023.jpg', true, NOW()),
(6, 'video', 'horizontal', '1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs', 'ÁREA EXTERNA EM MADEIRA', 'Soluções estruturais e decorativas para áreas abertas', 'ÁREAS EXTERNAS', 'Projeto e montagem de estruturas externas resistentes ao sol e chuva com estética natural.', 'https://drive.google.com/file/d/1KYP9CVH94EqBlIJno7avKsTkxYf6xFCs/preview', 'assets/portfolio/IMG-20261004-WA0006.jpg', false, NOW()),
(7, 'foto', 'vertical', '1vD0o54VW9e0CoLFHr4NxvEqF5c3qmfs2', 'DECK EM MADEIRA MACIÇA', 'Projeto e execução para área externa', 'ÁREAS EXTERNAS', 'Deck suspenso em réguas de madeira nobre com balizadores de piso integrados e acabamento acetinado.', 'assets/portfolio/IMG-20261004-WA0006.jpg', 'assets/portfolio/IMG-20261004-WA0006.jpg', true, NOW()),
(8, 'foto', 'horizontal', '18koAp3WQPfUI7-XGCsTJnkNdT3ag-n8j', 'MÓVEL PARA LIVING', 'Móvel baixo sob medida com gavetões e painel', 'MÓVEIS SOB MEDIDA', 'Mobiliário planejado para sala de estar integrando painel de TV e armários inferiores.', 'assets/portfolio/IMG-20261004-WA0013.jpg', 'assets/portfolio/IMG-20261004-WA0013.jpg', false, NOW()),
(9, 'foto', 'horizontal', '1p3Sr741KCf6hhjLtQy7OwzNSg6RkbX4f', 'BANCADA COM CAVA INTEGRADA', 'Puxadores usinados em cava e acabamento acetinado', 'MÓVEIS SOB MEDIDA', 'Solução minimalista de armários sem puxadores externos, valorizando a pureza das linhas.', 'assets/portfolio/IMG-20261004-WA0014.jpg', 'assets/portfolio/IMG-20261004-WA0014.jpg', false, NOW()),
(10, 'foto', 'vertical', '19ExhkajsWto9piV8CBPzWXUkpnop4UcN', 'ARMÁRIO DE DORMITÓRIO', 'Portas de correr com perfil e aproveitamento de pé-direito', 'MÓVEIS SOB MEDIDA', 'Armário planejado para quarto com portas deslizantes leves e divisão interna personalizada.', 'assets/portfolio/IMG-20261004-WA0015.jpg', 'assets/portfolio/IMG-20261004-WA0015.jpg', false, NOW()),
(11, 'foto', 'vertical', '1QcLIs0It9t7nfIF7UfpcfGDHIXg7bp6u', 'MÓDULO COM NICHOS DECORATIVOS', 'Divisão proporcional sob medida para ambientes internos', 'MÓVEIS SOB MEDIDA', 'Módulo torre com nichos decorativos integrados e suporte para embutimento sob medida.', 'assets/portfolio/IMG-20261004-WA0016.jpg', 'assets/portfolio/IMG-20261004-WA0016.jpg', false, NOW()),
(12, 'foto', 'horizontal', '1vRcS5p-vUlI8gA0JD0hHSV_MHLbN-D61', 'BANCADA GOURMET SOB MEDIDA', 'Marcenaria funcional para cozinha e área gourmet', 'MÓVEIS SOB MEDIDA', 'Composição de bancada e gaveteiros térmicos com encaixe ergonômico para área gourmet.', 'assets/portfolio/IMG-20261004-WA0017.jpg', 'assets/portfolio/IMG-20261004-WA0017.jpg', false, NOW()),
(13, 'foto', 'horizontal', '1lbzwv1kntpKbitrPzRBWaCNNQuMqH57m', 'ESTANTE COM PRATELEIRAS FLUTUANTES', 'Fixação oculta e composição minimalista para sala', 'MÓVEIS SOB MEDIDA', 'Prateleiras engastadas com estrutura interna reforçada suportando peso com leveza visual.', 'assets/portfolio/IMG-20261004-WA0018.jpg', 'assets/portfolio/IMG-20261004-WA0018.jpg', false, NOW()),
(14, 'foto', 'vertical', '1K1hF4glYsmHyBz5YNhnNZ9SE9SsGhBN6', 'ORATÓRIO EM MADEIRA RIPADA', 'Peça personalizada esculpida em madeira nobre', 'PROJETOS ESPECIAIS', 'Obra autoral esculpida em madeira nobre com detalhe ripado e visor frontal em vidro.', 'assets/portfolio/IMG-20261004-WA0019.jpg', 'assets/portfolio/IMG-20261004-WA0019.jpg', true, NOW()),
(15, 'foto', 'vertical', '1jpFzyrxbXQgHclrM0Zp0dCKWsmVNsrMX', 'PAINEL COM PORTA MIMETIZADA', 'Integração contínua entre revestimento e passagem oculta', 'MADEIRA & REVESTIMENTOS', 'Painel decorativo contínuo com porta oculta que se integra perfeitamente ao ambiente.', 'assets/portfolio/IMG-20261004-WA0020.jpg', 'assets/portfolio/IMG-20261004-WA0020.jpg', false, NOW()),
(16, 'foto', 'vertical', '18P3cPr_-pc8WOQ2jEdeYfjGUCXMwKg2o', 'PROJETO & DESENHO TÉCNICO', 'Detalhamento milimétrico, plantas e especificações executivas', 'PROJETOS ESPECIAIS', 'Plantas, cotas e especificações de marcenaria que garantem fidelidade total na execução.', 'assets/portfolio/Digitalizado_20261004-2113.pdf', 'assets/portfolio/pdf_page1.jpg', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  tipo_midia = EXCLUDED.tipo_midia,
  proporcao = EXCLUDED.proporcao,
  gdrive_id = EXCLUDED.gdrive_id,
  titulo = EXCLUDED.titulo,
  subtitulo = EXCLUDED.subtitulo,
  categoria = EXCLUDED.categoria,
  descricao = EXCLUDED.descricao,
  midia_url = EXCLUDED.midia_url,
  poster_url = EXCLUDED.poster_url,
  destaque = EXCLUDED.destaque;

SELECT setval('portfolio_id_seq', (SELECT MAX(id) FROM public.portfolio));
