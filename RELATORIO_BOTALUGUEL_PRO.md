# Relatório Completo — BotAluguel Pro

**Data:** 12 de Abril de 2026
**Versão:** 1.0 (Pré-lançamento)

---

## 1. Visão Geral do Produto

**BotAluguel Pro** é uma plataforma SaaS (Software as a Service) brasileira que permite a qualquer pessoa criar, configurar e gerenciar bots de WhatsApp sem precisar programar.

### Proposta de Valor
- **Sem código**: Editor visual drag-and-drop para montar fluxos de bot
- **Sem servidor externo**: Conexão direta via QR Code ou código de 8 dígitos (sem Termux)
- **Pagamento via PIX**: Sistema de moedas compradas com PIX (R$ 1,00 = 100 moedas)
- **Multiplataforma**: Acesso via Web (navegador) e App Mobile (iOS/Android)

### Público-Alvo
- Donos de grupos de WhatsApp que precisam de automação
- Pequenos empreendedores que querem atendimento automatizado
- Comunidades e moderadores de grupos
- Usuários que vendem bots como serviço

---

## 2. Arquitetura Técnica

### Stack Tecnológico
| Componente | Tecnologia |
|---|---|
| **Monorepo** | pnpm workspaces |
| **Backend** | Node.js 24 + Express 5 + TypeScript 5.9 |
| **Banco de dados** | PostgreSQL + Drizzle ORM |
| **Frontend Web** | React + Vite + Tailwind CSS + Framer Motion |
| **App Mobile** | React Native + Expo (expo-router) |
| **Autenticação** | JWT (jsonwebtoken + bcryptjs) |
| **WhatsApp** | Baileys (conexão direta, sem API oficial) |
| **Validação** | Zod v4 |
| **API Client** | Orval (gerado de OpenAPI spec) |
| **Build** | esbuild (CJS bundle) |

### Estrutura do Projeto
```
├── artifacts/
│   ├── api-server/        → API REST (Express) — ~3.066 linhas
│   ├── bot-aluguel-pro/   → Frontend Web (React/Vite) — ~10.467 linhas
│   └── bot-aluguel-mobile/→ App Mobile (Expo) — ~6.944 linhas
├── lib/
│   ├── db/                → Schema do banco (Drizzle ORM) — ~4.357 linhas
│   └── api-client-react/  → Cliente API compartilhado
└── Total: ~24.834 linhas de código TypeScript
```

### Banco de Dados (7 tabelas)
| Tabela | Função |
|---|---|
| `users` | Usuários (telefone, senha, moedas, isAdmin) |
| `bots` | Instâncias de bots WhatsApp (nome, status, QR code) |
| `bot_commands` | Fluxos visuais (nodes/edges em JSONB) |
| `active_plans` | Planos ativos dos usuários |
| `payments` | Transações PIX e compras de moedas |
| `notifications` | Notificações do sistema |
| `plans` | Planos disponíveis (hardcoded) |

---

## 3. Funcionalidades Implementadas

### 3.1 Landing Page (Web)
- Hero animado com contadores
- Seção de recursos/features
- "Como funciona" em 3 passos
- Tabela de planos e preços
- Depoimentos de usuários
- FAQ acordeão
- CTA final + Footer completo
- Toda em PT-BR

### 3.2 Sistema de Autenticação
- Cadastro via telefone + senha
- Login com JWT
- 30 moedas de boas-vindas no cadastro
- Armazenamento de token no localStorage

### 3.3 Dashboard
- **Web**: Wave header SVG, cards de atalho (Criar Bot, Construtor, Moedas, Planos), lista de bots com status, painel lateral com stats
- **Mobile**: Header com ícone terminal + PRO badge, card "Criar Novo Bot" com seletor de plataforma (WhatsApp/Discord/Telegram), stats overview, bot cards com glow colorido

### 3.4 Gerenciamento de Bots
- Listar, criar e deletar bots
- Conexão via QR Code (scan) ou código de pareamento de 8 dígitos
- Status em tempo real via SSE (Server-Sent Events)
- Auto-reconexão de sessões ao reiniciar servidor
- Sessões persistentes em disco

### 3.5 Builder Visual (Editor de Fluxos)
O coração do produto — editor drag-and-drop no estilo n8n/Node-RED:

**Blocos disponíveis:**
- **Comando** — Gatilho que inicia o fluxo (prefixo + palavra-chave)
- **Ação** — 85+ tipos de ação implementados no backend
- **Condição** — Bloco lógico com 2 saídas (SIM/NÃO), 28 tipos de condição
- **Resposta** — 6 tipos (texto, lista, imagem, áudio, localização, contato)
- **Botões** — Botões interativos (normal, lista/menu, ligar)

**85+ Ações incluem:**
- Menus (foto, admin, games, owner)
- 12 jogos (moeda, dado, sorteio, amor, ship, nota, sorte, V/D, roleta, top5, rank, piada)
- Moderação completa (kick, ban, warn, promover, rebaixar, mutar)
- Gerenciamento de grupo (fechar, abrir, info, link, nome, descrição)
- Comandos de dono (ligar, desligar, broadcast, bloquear)
- Boas-vindas/despedida
- Utilitários (CEP, calculadora, figurinha, hidetag, webhook HTTP)
- Ações avançadas (simular digitando, delay, marcar como lido, manipular moedas)

**16 Variáveis dinâmicas:**
`{nome}`, `{numero}`, `{user}`, `{grupo}`, `{membros}`, `{admins}`, `{moedas}`, `{plano}`, `{prefix}`, `{bot}`, `{data}`, `{hora}`, `{dono}`, `{args}`, `{quoted}`, `{botname}`

**9 Templates prontos:**
Figurinha, Menu com Foto, Moderação, Proteção Total, Sistema de Dono, Diversão, Ferramentas de Grupo, Mensagens Interativas, TUDO INCLUSO (96+ blocos)

**Gestos mobile otimizados:**
- 1 dedo = arrastar canvas (pan)
- Pinça = zoom
- Long-press 200ms = mover bloco
- Feedback visual (outline laranja + vibração)

### 3.6 Sistema de Moedas e Planos

**Planos:**
| Plano | Custo | Duração |
|---|---|---|
| Básico | 100 moedas | 30 dias |
| Pro | 250 moedas | 30 dias |
| Premium | 500 moedas | 30 dias |

**Economia:**
- R$ 1,00 = 100 moedas
- 30 moedas grátis no cadastro
- Recarga via PIX com código copia-e-cola

### 3.7 Pagamentos
- Geração de PIX (QR Code / copia-e-cola)
- Histórico de transações
- Botões de valores rápidos

### 3.8 Painel Administrativo
- Estatísticas globais da plataforma
- Tabela de usuários
- Tabela de pagamentos
- Envio de notificações broadcast

### 3.9 App Mobile (iOS/Android)
- Onboarding de 4 slides
- Todas as funcionalidades do web adaptadas
- Bottom navigation (Hub, Bots, Moedas, Planos, Config)
- FAB roxo central para ações rápidas
- Tela de notificações
- Builder visual com gestos touch

---

## 4. Design e Identidade Visual

### Paleta de Cores
| Elemento | Cor |
|---|---|
| Fundo principal | `#090A0F` (web) / `#0F0F14` (mobile) |
| Roxo primário | `#7C3AED` / `#6D28D9` |
| Accent | `#8B5CF6` |
| Cards (mobile) | `#1A1A24` |
| Online | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |

### Estilo
- **Web**: Tema "Pterodactyl" — dark mode profundo, gradientes roxos, animações suaves com Framer Motion
- **Mobile**: Tema "HubPlatform Dark" — cards com bordas sutis, headers flat, glow colorido nos bot cards

---

## 5. Telas e Rotas

### Web (12 rotas)
| Rota | Tela |
|---|---|
| `/` | Landing Page |
| `/login` | Login |
| `/register` | Cadastro |
| `/dashboard` | Dashboard principal |
| `/dashboard/bots` | Lista de bots |
| `/dashboard/bots/:botId` | Detalhe do bot |
| `/dashboard/builder` | Editor visual |
| `/dashboard/plans` | Planos |
| `/dashboard/payments` | Pagamentos/Moedas |
| `/dashboard/settings` | Configurações |
| `/admin` | Painel admin |
| `*` | Página 404 |

### Mobile (12 telas)
| Tela | Função |
|---|---|
| Onboarding | Introdução (4 slides) |
| Login / Registro | Autenticação |
| Hub (Tab) | Dashboard |
| Bots (Tab) | Lista de bots |
| Moedas (Tab) | Recarga PIX |
| Planos (Tab) | Assinatura |
| Config (Tab) | Configurações |
| Bot Detail | Gerenciar bot |
| Bot Settings | Config do bot |
| Builder | Editor de fluxos |
| Builder Picker | Escolher bot para editar |
| Notificações | Alertas do sistema |

---

## 6. API Endpoints (Backend)

### Autenticação
| Método | Endpoint | Função |
|---|---|---|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Fazer login |
| GET | `/auth/me` | Perfil do usuário |

### Bots
| Método | Endpoint | Função |
|---|---|---|
| GET | `/bots` | Listar bots |
| POST | `/bots` | Criar bot |
| GET | `/bots/:id` | Detalhe do bot |
| DELETE | `/bots/:id` | Deletar bot |
| PATCH | `/bots/:id/settings` | Atualizar configurações |
| POST | `/bots/:id/connect` | Conectar WhatsApp |
| POST | `/bots/:id/disconnect` | Desconectar |
| GET | `/bots/:id/stream` | SSE (status em tempo real) |

### Comandos/Fluxos
| Método | Endpoint | Função |
|---|---|---|
| GET | `/bots/:id/commands` | Obter fluxo |
| PUT | `/bots/:id/commands` | Salvar fluxo |

### Planos e Pagamentos
| Método | Endpoint | Função |
|---|---|---|
| GET | `/plans` | Listar planos |
| GET | `/plans/active` | Plano ativo |
| POST | `/plans/:id/activate` | Ativar plano |
| POST | `/payments/pix` | Gerar PIX |
| GET | `/payments/pix/:txid` | Status do PIX |
| GET | `/payments/history` | Histórico |

### Admin
| Método | Endpoint | Função |
|---|---|---|
| GET | `/admin/stats` | Estatísticas |
| POST | `/admin/notifications/send` | Broadcast |
| GET | `/notifications` | Notificações do usuário |

---

## 7. O Que Está Funcionando

- [x] Landing page completa e animada
- [x] Cadastro e login via telefone
- [x] Dashboard com estatísticas
- [x] Criação e gerenciamento de bots
- [x] Conexão WhatsApp via QR Code e código de pareamento
- [x] Builder visual com 85+ ações
- [x] 9 templates prontos
- [x] Sistema de moedas e planos
- [x] Interface PIX (mock)
- [x] Painel administrativo
- [x] App mobile completo com gestos otimizados
- [x] Onboarding mobile
- [x] Auto-reconexão de sessões WhatsApp
- [x] 16 variáveis dinâmicas nas mensagens
- [x] 28 tipos de condição no builder
- [x] Permissões por comando (owner_only, admin_only, etc.)
- [x] Página 404 personalizada

---

## 8. O Que Falta (Gaps Identificados)

### Crítico para Lançamento
| Item | Impacto | Status |
|---|---|---|
| Integração PIX real (EFI Bank/Mercado Pago) | Sem isso, não há receita | Mock |
| Recuperação de senha | Usuários ficam presos | Ausente |
| Termos de uso / Política de privacidade | Obrigatório legalmente | Ausente |
| Validação de entrada robusta | Segurança básica | Parcial |
| HTTPS/SSL em produção | Segurança obrigatória | Pendente de deploy |

### Importante para Retenção
| Item | Impacto |
|---|---|
| Teste/simulação de fluxo | Usuário não consegue testar bot sem enviar msg real |
| Logs de mensagens enviadas/recebidas | Impossível depurar problemas |
| Analytics por bot (msgs/dia, comandos mais usados) | Sem visibilidade de uso |
| Versionamento de fluxos (ctrl+Z global) | Risco de perder trabalho |
| Notificações push no mobile | Sem aviso de bot offline |

### Melhorias de Experiência
| Item | Impacto |
|---|---|
| Onboarding guiado na web | Web joga direto no dashboard |
| Edição de perfil (nome, foto) | Usuário não edita dados |
| Canal de suporte in-app | Sem forma de pedir ajuda |
| Loading states consistentes | Experiência incompleta em telas |
| Responsividade completa da web | Não otimizado para celular |

### Crescimento Futuro
| Item | Impacto |
|---|---|
| API pública / Webhooks para devs | Limita integrações externas |
| Sistema de afiliados/indicação | Sem crescimento orgânico |
| Suporte a Discord/Telegram (previsto no mobile UI) | Expandir para mais plataformas |
| Marketplace de templates | Comunidade cria e vende fluxos |
| Multi-idioma (EN/ES) | Limita ao mercado BR |

---

## 9. Métricas do Projeto

| Métrica | Valor |
|---|---|
| Total de linhas de código | ~24.834 |
| Tabelas no banco de dados | 7 |
| Endpoints da API | 18 |
| Telas na web | 12 |
| Telas no mobile | 12 |
| Ações do bot | 85+ |
| Templates prontos | 9 |
| Condições do builder | 28 |
| Variáveis dinâmicas | 16 |

---

## 10. Modelo de Negócio

### Receita
- **Venda de moedas via PIX** — R$ 1,00 = 100 moedas
- **Planos por assinatura mensal** — Básico (R$1), Pro (R$2,50), Premium (R$5)
- **Margem**: Custo de servidor vs. receita por usuário

### Diferenciais Competitivos
1. **Sem código** — Concorrentes exigem conhecimento técnico
2. **Sem servidor externo** — Concorrentes pedem VPS ou Termux
3. **PIX nativo** — Pagamento instantâneo sem cartão de crédito
4. **Editor visual completo** — 85+ ações prontas, muito mais que concorrentes
5. **App mobile nativo** — Gerenciar bot pelo celular
6. **Preço acessível** — A partir de R$ 1,00/mês

### Riscos
1. **Dependência do Baileys** — Biblioteca não-oficial do WhatsApp (risco de bloqueio)
2. **PIX em mock** — Sem receita real até integrar gateway
3. **Escalabilidade** — Cada bot consome uma sessão WebSocket ativa
4. **Compliance** — WhatsApp pode restringir bots não-oficiais

---

## 11. Conclusão

O **BotAluguel Pro** é um produto ambicioso e bem construído, com ~25 mil linhas de código, cobertura web + mobile, e um builder visual impressionante com 85+ ações. A base técnica está sólida.

**Para lançar**, os 3 itens mais urgentes são:
1. Integrar um gateway de pagamento PIX real
2. Adicionar recuperação de senha
3. Criar páginas de Termos de Uso e Política de Privacidade

**Para crescer**, o foco deve ser em analytics, logs de mensagens, e um sistema de indicação.

O produto tem potencial real no mercado brasileiro de automação WhatsApp, especialmente pelo preço acessível e pela facilidade de uso.

---

*Relatório gerado automaticamente em 12/04/2026*
