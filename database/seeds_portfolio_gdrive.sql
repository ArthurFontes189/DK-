-- ====================================================================
-- SEED DE MÍDIAS REAIS E VERIFICADAS - DK REVESTIMENTOS
-- 15 Obras Canônicas Autênticas (5 Vídeos HD, 9 Fotografias, 1 Projeto Técnico)
-- ====================================================================

ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS proporcao TEXT DEFAULT 'horizontal';
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS subtitulo TEXT;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT false;

DELETE FROM public.portfolio WHERE id = 6; -- Remove registro duplicado/fantasma

INSERT INTO public.portfolio (id, tipo_midia, proporcao, titulo, subtitulo, categoria, descricao, midia_url, poster_url, destaque, created_at)
VALUES
(1, 'video', 'vertical', 'AMBIENTE PLANEJADO', 'Aproveitamento inteligente de espaço e marcenaria fina', 'MARCENARIA', 'Projeto e execução de ambiente sob medida com marcenaria integrada e iluminação embutida.', 'assets/portfolio/VID-20261004-WA0053.mp4', 'assets/portfolio/poster_VID-20261004-WA0053.jpg', false, NOW()),
(2, 'video', 'vertical', 'PAINEL RIPADO EM MADEIRA', 'Revestimento vertical ripado com passagem oculta', 'MADEIRA & REVESTIMENTOS', 'Revestimento ripado em madeira nobre com alinhamento milimétrico e porta de acesso mimetizada.', 'assets/portfolio/VID-20261004-WA0024.mp4', 'assets/portfolio/poster_VID-20261004-WA0024.jpg', true, NOW()),
(3, 'video', 'horizontal', 'MOBILIÁRIO SOB MEDIDA', 'Mobiliário personalizado para residência', 'MÓVEIS SOB MEDIDA', 'Composição de armários e bancadas desenhados para máxima fluidez e funcionalidade.', 'assets/portfolio/VID-20261004-WA0021.mp4', 'assets/portfolio/poster_VID-20261004-WA0021.jpg', false, NOW()),
(4, 'video', 'vertical', 'MARCENARIA DE ALTO PADRÃO', 'Acabamento refinado e precisão nos encaixes', 'MARCENARIA', 'Demonstração prática dos sistemas de abertura suave, gavetões reforçados e marcenaria de precisão.', 'assets/portfolio/VID-20261004-WA0022.mp4', 'assets/portfolio/poster_VID-20261004-WA0022.jpg', false, NOW()),
(5, 'video', 'horizontal', 'PORTÃO E PAINEL EM MADEIRA', 'Fechamento em réguas de madeira maciça tratada', 'ÁREAS EXTERNAS', 'Estrutura robusta e elegante em madeira tratada contra intempéries com fechamento artesanal.', 'assets/portfolio/VID-20261004-WA0023.mp4', 'assets/portfolio/poster_VID-20261004-WA0023.jpg', true, NOW()),
(7, 'foto', 'vertical', 'DECK EM MADEIRA MACIÇA', 'Projeto e execução para área externa', 'ÁREAS EXTERNAS', 'Deck suspenso em réguas de madeira nobre com balizadores de piso integrados e acabamento acetinado.', 'assets/portfolio/IMG-20261004-WA0006.jpg', 'assets/portfolio/IMG-20261004-WA0006.jpg', true, NOW()),
(8, 'foto', 'horizontal', 'MÓVEL PARA LIVING', 'Móvel baixo sob medida com gavetões e painel', 'MÓVEIS SOB MEDIDA', 'Mobiliário planejado para sala de estar integrando painel de TV e armários inferiores.', 'assets/portfolio/IMG-20261004-WA0013.jpg', 'assets/portfolio/IMG-20261004-WA0013.jpg', false, NOW()),
(9, 'foto', 'horizontal', 'BANCADA COM CAVA INTEGRADA', 'Puxadores usinados em cava e acabamento acetinado', 'MÓVEIS SOB MEDIDA', 'Solução minimalista de armários sem puxadores externos, valorizando a pureza das linhas.', 'assets/portfolio/IMG-20261004-WA0014.jpg', 'assets/portfolio/IMG-20261004-WA0014.jpg', false, NOW()),
(10, 'foto', 'vertical', 'ARMÁRIO DE DORMITÓRIO', 'Portas de correr com perfil e aproveitamento de pé-direito', 'MÓVEIS SOB MEDIDA', 'Armário planejado para quarto com portas deslizantes leves e divisão interna personalizada.', 'assets/portfolio/IMG-20261004-WA0015.jpg', 'assets/portfolio/IMG-20261004-WA0015.jpg', false, NOW()),
(11, 'foto', 'vertical', 'MÓDULO COM NICHOS DECORATIVOS', 'Divisão proporcional sob medida para ambientes internos', 'MÓVEIS SOB MEDIDA', 'Módulo torre com nichos decorativos integrados e suporte para embutimento sob medida.', 'assets/portfolio/IMG-20261004-WA0016.jpg', 'assets/portfolio/IMG-20261004-WA0016.jpg', false, NOW()),
(12, 'foto', 'horizontal', 'BANCADA GOURMET SOB MEDIDA', 'Marcenaria funcional para cozinha e área gourmet', 'MÓVEIS SOB MEDIDA', 'Composição de bancada e gaveteiros térmicos com encaixe ergonômico para área gourmet.', 'assets/portfolio/IMG-20261004-WA0017.jpg', 'assets/portfolio/IMG-20261004-WA0017.jpg', false, NOW()),
(13, 'foto', 'horizontal', 'ESTANTE COM PRATELEIRAS FLUTUANTES', 'Fixação oculta e composição minimalista para sala', 'MÓVEIS SOB MEDIDA', 'Prateleiras engastadas com estrutura interna reforçada suportando peso com leveza visual.', 'assets/portfolio/IMG-20261004-WA0018.jpg', 'assets/portfolio/IMG-20261004-WA0018.jpg', false, NOW()),
(14, 'foto', 'vertical', 'ORATÓRIO EM MADEIRA RIPADA', 'Peça personalizada esculpida em madeira nobre', 'PROJETOS ESPECIAIS', 'Obra autoral esculpida em madeira nobre com detalhe ripado e visor frontal em vidro.', 'assets/portfolio/IMG-20261004-WA0019.jpg', 'assets/portfolio/IMG-20261004-WA0019.jpg', true, NOW()),
(15, 'foto', 'vertical', 'PAINEL COM PORTA MIMETIZADA', 'Integração contínua entre revestimento e passagem oculta', 'MADEIRA & REVESTIMENTOS', 'Painel decorativo contínuo com porta oculta que se integra perfeitamente ao ambiente.', 'assets/portfolio/IMG-20261004-WA0020.jpg', 'assets/portfolio/IMG-20261004-WA0020.jpg', false, NOW()),
(16, 'foto', 'vertical', 'PROJETO & DESENHO TÉCNICO', 'Detalhamento milimétrico, plantas e especificações executivas', 'PROJETOS ESPECIAIS', 'Plantas, cotas e especificações de marcenaria que garantem fidelidade total na execução.', 'assets/portfolio/Digitalizado_20261004-2113.pdf', 'assets/portfolio/pdf_page1.jpg', false, NOW())
ON CONFLICT (id) DO UPDATE SET 
  tipo_midia = EXCLUDED.tipo_midia,
  proporcao = EXCLUDED.proporcao,
  titulo = EXCLUDED.titulo,
  subtitulo = EXCLUDED.subtitulo,
  categoria = EXCLUDED.categoria,
  descricao = EXCLUDED.descricao,
  midia_url = EXCLUDED.midia_url,
  poster_url = EXCLUDED.poster_url,
  destaque = EXCLUDED.destaque;

SELECT setval('portfolio_id_seq', (SELECT MAX(id) FROM public.portfolio));
