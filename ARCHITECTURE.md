# 🏛️ Documentação de Arquitetura de Software - DK Construtora & Serviços

Este documento detalha as decisões técnicas, organização de diretórios, padrões de projeto e fluxo de dados da plataforma web **DK Construtora & Serviços**.

---

## 1. Visão Geral da Arquitetura

O sistema adota uma **Arquitetura em Camadas (Layered Architecture)** com separação estrita de responsabilidades, garantindo alta manutenibilidade, performance e desacoplamento sem a necessidade de etapas complexas de compilação (*build step*), permitindo execução instantânea no **GitHub Pages** ou qualquer CDN estática.

```
┌─────────────────────────────────────────────────────────────┐
│                 Interface do Usuário (UI)                   │
│   Site do Cliente (Catálogo Vertical) | Painel Marceneiro   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│  Módulos de Domínio         │ │  Componentes Compartilhados │
│  - Leads / CRM              │ │  - Toast Notifications      │
│  - Clientes (CPF & Código)  │ │  - Accessible Modals        │
│  - Fichas de Produção       │ └─────────────────────────────┘
│  - Fluxo de Caixa           │
│  - Catálogo de Mídias       │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│  Camada de Serviços (Services Layer)                         │
│  - Storage Service (Cache Local / Fallback Offline)         │
│  - API Service (Supabase PostgreSQL Client + Realtime WS)   │
└──────────────┬───────────────────────────────┬──────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│  Banco de Dados em Nuvem (PostgreSQL @ Supabase)             │
│  leads | clients | services | transactions | portfolio      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Diretórios Canônica

```
marcenaria-madeira-e-raiz/
├── assets/
│   └── favicon.svg             # Ícone vetorial da marca
├── manifest.json               # Manifesto PWA para instalação no celular
├── css/
│   ├── variables.css           # Tokens: cores nobres, fontes e espaçamentos
│   ├── base.css                # Reset moderno e tipografia base
│   ├── components.css          # Botões, badges, modais, formulários e alertas
│   ├── site.css                # Seções públicas (Hero, catálogo e orçamento)
│   ├── admin.css               # Painel de gestão do marceneiro (CRM, fichas e caixa)
│   ├── responsive.css          # Breakpoints e adaptações para mobile e tablet
│   └── style.css               # Folha mestra com imports organizados
├── js/
│   ├── config.js               # Chaves de API e WhatsApp oficial
│   ├── services/
│   │   ├── storage.js          # Estado reativo central (db) e cache offline
│   │   └── api.js              # Cliente Supabase, queries e ouvintes Realtime
│   ├── ui/
│   │   ├── toast.js            # Sistema visual de feedback e alertas
│   │   └── modals.js           # Gerenciador de janelas modais com acessibilidade
│   ├── modules/
│   │   ├── auth.js             # Controle de sessão do marceneiro e telas
│   │   ├── leads.js            # Recepção de orçamentos e CRM comercial
│   │   ├── clients.js          # Cadastro mestre de clientes, CPF e histórico
│   │   ├── services.js         # Ordens de produção, materiais, prazos e quitação
│   │   ├── finance.js          # Fluxo de caixa analítico (entradas e saídas)
│   │   └── portfolio.js        # Catálogo vertical de fotos e vídeos MP4
│   └── app.js                  # Ponto de entrada (Entrypoint) e ciclo de vida
├── database/
│   └── schema.sql              # Script SQL unificado para criação/alinhamento de tabelas
├── ARCHITECTURE.md             # Esta documentação técnica
├── README.md                   # Guia rápido de uso e publicação
└── index.html                  # Marcação semântica limpa e acessível
```

---

## 3. Padrões de Projeto Adotados

### 3.1. Database-First com Camada Resiliente (`safeDbInsert` e `safeDbUpdate`)
Cada ação de escrita (`insert`, `update`, `delete`) valida a resposta do PostgreSQL. Se uma coluna específica ainda não existir no schema do banco, a camada resiliente detecta o nome do campo dinamicamente, remove-o do payload e reenvia a requisição de forma transparente, impedindo que a aplicação trave.

### 3.2. Sincronização em Tempo Real (Event-Driven Realtime)
O módulo `js/services/api.js` abre um canal WebSocket com o Supabase (`supabase_realtime`). Qualquer novo orçamento solicitado no celular do cliente atualiza o painel do marceneiro no computador no mesmo instante.

### 3.3. Transição Atômica de Lead para Cliente
Quando o marceneiro clica em **"Criar Ficha do Cliente"** em um orçamento:
1. O sistema verifica se o telefone/CPF já pertence a um cliente existente.
2. Se não existir, gera um novo código sequencial (`CLI-XXXX`) e cria o registro na tabela `clients`.
3. Associa a nova ficha de serviço ao `client_id`.
4. Remove o lead da fila de pendências para evitar retrabalho.
5. Se houver sinal pago de entrada, gera automaticamente o lançamento positivo no Fluxo de Caixa.

---

## 7. Módulo de Gerenciamento de Obras & Caixa Centralizado (Versão 2026.09)

O módulo de Obras foi expandido para atender à gestão integral de canteiro, oficina e lucratividade individual por projeto:

1. **Gestão de Funcionários & Diaristas (`employees.js`):**
   - Cadastro corporativo de colaboradores (nome, cargo, telefone, chave PIX, valor da diária padrão e anexo de contrato de trabalho/termo de prestação).
   - Suporte a upload e visualização direta de contratos em PDF ou imagem.

2. **Alocação de Equipe por Obra:**
   - Vinculação de profissionais em cada obra com quantidade de dias trabalhados e valor da diária acordado.
   - Cálculo automático do custo de mão de obra (`diaria * dias`).
   - Controle de status de pagamento (Pendente / Quitado) com anexo de contrato de trabalho específico do projeto.

3. **Caixa Centralizado da Obra (DRE por Projeto):**
   - **Receitas:** Valor total contratado, entrada/sinal e saldo pendente do cliente.
   - **Gastos de Insumos:** Registro de compras de materiais (madeiras, MDF, ferragens, tintas, fretes) com categorização e fornecedor.
   - **Gastos de Diárias:** Totalização automática da equipe alocada.
   - **Lucro Líquido Previsto & Margem (%):** Apuração em tempo real da rentabilidade exata de cada obra.

4. **Hub de Inspeção 360° da Obra (`#obraInspectModal`):**
   - Painel expandido acessível pelo card da obra com visão unificada de equipe, insumos, balanço financeiro e contratos.
