# 🪚 DK Revestimentos - Marcenaria, Obras e Gestão Integrada

Plataforma web profissional e responsiva desenvolvida para marcenarias e prestadores de serviços sob medida. Integra catálogo de projetos com fotos e vídeos (YouTube, Shorts e arquivos locais com geração automática de capa), captação de leads via WhatsApp, CRM comercial, cadastro unificado de clientes, fichas técnicas de serviços e controle de fluxo de caixa com banco de dados em nuvem via **Supabase**.

---

## 📁 Estrutura do Projeto

O projeto adota uma arquitetura em camadas totalmente modular e desacoplada:

```
marcenaria-madeira-e-raiz/
│
├── index.html              # Interface do site e painel administrativo (HTML5 semântico)
├── manifest.json           # Manifesto PWA para instalar como aplicativo no smartphone
├── README.md               # Manual prático de operação e publicação (sem dados sensíveis)
├── ARCHITECTURE.md         # Documentação técnica de arquitetura e fluxo de dados
│
├── assets/                 # Logotipos e ícones vetoriais da marca
│   ├── favicon.svg
│   ├── logo.svg
│   └── logo-icon.svg
│
├── css/                    # Estilos modulares organizados por responsabilidade
│   ├── variables.css       # Tokens de design (paleta de cores, tipografia e espaçamentos)
│   ├── base.css            # Reset moderno e tipografia base com proteção contra overflow
│   ├── components.css      # Botões, modais, formulários, alertas e dropzones
│   ├── site.css            # Seções públicas (Hero, portfólio, catálogo e contato)
│   ├── admin.css           # Painel de gestão do marceneiro (CRM, fichas, equipe e caixa)
│   ├── responsive.css      # Breakpoints e adaptações mobile/tablet sem transbordo
│   └── style.css           # Folha mestra com todos os estilos unificados
│
├── js/                     # Lógica JavaScript desacoplada em módulos
│   ├── config.js           # Arquivo de configuração de credenciais e parâmetros
│   ├── services/
│   │   ├── storage.js      # Gerenciamento de estado em memória (db) e cache offline
│   │   └── api.js          # Conexão com Supabase e ouvinte Realtime (WebSocket)
│   ├── ui/
│   │   ├── toast.js        # Mensagens e notificações flutuantes
│   │   └── modals.js       # Controle de janelas modais com acessibilidade
│   ├── modules/
│   │   ├── auth.js         # Sessão do marceneiro e alternância de telas
│   │   ├── leads.js        # Funil comercial (CRM) e captação de orçamentos
│   │   ├── clients.js      # Gestão de clientes com código CLI-XXXX e histórico
│   │   ├── services.js     # Fichas de produção, status e quitação rápida
│   │   ├── employees.js    # Gestão de colaboradores, diaristas e contratos de equipe
│   │   ├── finance.js      # Fluxo de caixa analítico (entradas, saídas e saldo)
│   │   └── portfolio.js    # Catálogo de fotos e vídeos com player responsivo
│   └── app.js              # Inicialização do ciclo de vida e orquestrador
│
└── database/
    ├── schema.sql          # Script SQL canônico para criação/alinhamento de tabelas
    └── habilitar_storage.sql # Configuração do bucket público de armazenamento de mídias
```

---

## ⚙️ Configuração de Ambiente (`js/config.js`)

As configurações de integração com serviços externos ficam centralizadas exclusivamente no arquivo `js/config.js`. 

Para conectar ao seu próprio projeto do **Supabase**, preencha os parâmetros no arquivo conforme o modelo abaixo:

```javascript
// Exemplo de configuração em js/config.js:
const SUPABASE_PROJECT_REF = "SEU_PROJECT_REF_AQUI";
const SUPABASE_URL = "https://SEU_PROJETO.supabase.co";
const SUPABASE_KEY = "SUA_CHAVE_PUBLICA_ANON_AQUI";

// Telefone do WhatsApp para recebimento de pedidos de orçamento:
const WHATSAPP_PHONE = "5561999999999";
```

> **Dica de Segurança:** Nunca armazene chaves secretas com privilégios de administrador (`service_role`) em arquivos do frontend ou repositórios públicos. Utilize estritamente a chave pública anônima (`anon key`).

---

## 🗄️ Configuração do Banco de Dados (Supabase)

1. Acesse o painel do seu projeto no **Supabase** via navegador.
2. Navegue até o menu **SQL Editor** e clique em **New Query**.
3. Copie e execute o conteúdo do arquivo `database/schema.sql`.
4. *(Opcional)* Para habilitar o envio de arquivos diretamente para a nuvem pelo painel, execute também o script `database/habilitar_storage.sql`.

### Tabelas Estruturadas:
* `leads`: Orçamentos enviados pelos clientes através do formulário do site.
* `clients`: Cadastro oficial de clientes com código `CLI-XXXX`, contato e endereço.
* `services`: Ordens de serviço e fichas de produção com prazos, materiais e valores.
* `employees`: Registro de colaboradores, diaristas, valores de diárias e contratos.
* `transactions`: Fluxo de caixa analítico (entradas, despesas operacionais e de obras).
* `portfolio`: Catálogo multimídia com URLs de vídeos, capas geradas e fotografias.

---

## 🚀 Publicação e Hospedagem

Por ser uma aplicação baseada em padrões web nativos (HTML5, CSS3 e JavaScript ES6+), o projeto não requer dependências de build e pode ser hospedado gratuitamente em qualquer servidor estático:

* **GitHub Pages:**
  1. Envie os arquivos para o seu repositório no GitHub.
  2. Acesse **Settings** > **Pages**.
  3. Em **Build and deployment**, selecione a branch `main` e a pasta `/ (root)`.
  4. Salve para gerar o link público.
* **Vercel / Netlify:**
  1. Conecte o repositório ou arraste a pasta do projeto diretamente na interface da plataforma.
  2. A publicação é instantânea e inclui certificado SSL automático.
* **Hospedagem Própria / cPanel:**
  1. Basta enviar o conteúdo da pasta para o diretório raiz `public_html`.
