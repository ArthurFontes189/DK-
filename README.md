# 🪚 DK Revestimentos - Marcenaria, Obras e Gestão Integrada

Plataforma web profissional e responsiva desenvolvida para marcenarias e prestadores de serviços em madeira, integrando catálogo vertical de projetos (vídeos e fotos no formato Stories/Reels), captação de leads via WhatsApp, CRM comercial, cadastro unificado de clientes com CPF, fichas técnicas de serviços e fluxo de caixa com banco de dados em nuvem via **Supabase**.

---

## 📁 Estrutura Limpa e Profissional do Projeto

O projeto adota uma arquitetura em camadas totalmente modular, sem arquivos duplicados ou código morto:

```
marcenaria-madeira-e-raiz/
│
├── index.html              # Interface do site e painel administrativo (HTML5 semântico)
├── manifest.json           # Manifesto PWA para instalar como aplicativo no smartphone
├── README.md               # Manual prático de operação e publicação
├── ARCHITECTURE.md         # Documentação técnica de arquitetura e fluxo de dados
│
├── assets/
│   └── favicon.svg         # Ícone vetorial da marca em alta resolução
│
├── css/                    # Estilos modulares organizados por responsabilidade
│   ├── variables.css       # Tokens de design (cores nobres, fontes e espaçamentos)
│   ├── base.css            # Reset moderno e tipografia base
│   ├── components.css      # Botões, badges, modais, formulários e alertas
│   ├── site.css            # Seções públicas (Hero, catálogo e formulário)
│   ├── admin.css           # Painel de gestão do marceneiro (CRM, fichas e caixa)
│   ├── responsive.css      # Regras de adaptação mobile e tablet
│   └── style.css           # Folha mestra com imports organizados
│
├── js/                     # Lógica JavaScript desacoplada em módulos
│   ├── config.js           # Chaves de acesso ao Supabase e WhatsApp (isolado)
│   ├── services/
│   │   ├── storage.js      # Gerenciamento de estado (db) e cache offline
│   │   └── api.js          # Conexão com Supabase e ouvinte Realtime (WebSocket)
│   ├── ui/
│   │   ├── toast.js        # Mensagens e notificações flutuantes
│   │   └── modals.js       # Controle de janelas modais com acessibilidade
│   ├── modules/
│   │   ├── auth.js         # Sessão do marceneiro e alternância de telas
│   │   ├── leads.js        # Funil comercial (CRM) e captação de orçamentos
│   │   ├── clients.js      # Gestão de clientes com código CLI-XXXX e CPF
│   │   ├── services.js     # Fichas de produção, status e quitação rápida
│   │   ├── finance.js      # Fluxo de caixa analítico (entradas, saídas e saldo)
│   │   └── portfolio.js    # Catálogo vertical de fotos e vídeos MP4
│   └── app.js              # Inicialização do ciclo de vida e orquestrador
│
└── database/
    └── schema.sql          # Script SQL canônico para criar/alinhar tabelas no Supabase
```

---

## ⚙️ Conexão com o Banco de Dados (Supabase)

O arquivo `js/config.js` já vem **100% pré-configurado** com as credenciais do seu projeto:

```javascript
const SUPABASE_PROJECT_REF = "rmzhabsrcsaxqnqypoje";
const SUPABASE_URL = "https://rmzhabsrcsaxqnqypoje.supabase.co";
const SUPABASE_KEY = "sb_publishable_v3aTz-JyDTHnzy3e6rjP9g_lb6cygX5";
```

Qualquer aparelho (computador ou celular) que abrir o site já conecta automaticamente à nuvem.

---

## 🗄️ Como Executar o Script do Banco de Dados

1. Acesse o painel do seu projeto no Supabase: [Dashboard](https://supabase.com/dashboard/project/rmzhabsrcsaxqnqypoje)
2. Acesse **SQL Editor** > **New Query**
3. Cole o conteúdo de `database/schema.sql` e clique em **Run**.

Tabelas sincronizadas:
* `leads`: Orçamentos enviados pelos clientes via site
* `clients`: Clientes oficiais com código `CLI-XXXX`, CPF, telefone e endereço
* `services`: Fichas de produção, materiais, valores, pagamentos e prazos
* `transactions`: Fluxo de caixa com entradas e saídas
* `portfolio`: Catálogo com mídias verticais (vídeos MP4 e fotos)

---

## 🚀 Como Publicar no GitHub Pages

1. Crie ou acerte seu repositório no GitHub.
2. Faça o commit e push de todos os arquivos.
3. No GitHub, vá em **Settings** > **Pages**.
4. Em **Build and deployment**, selecione a branch `main` e a pasta `/ (root)`.
5. Clique em **Save**. O link estará no ar com sincronização em tempo real.
