# BotAluguel Pro

## Overview

**BotAluguel Pro** — SaaS de bots WhatsApp para usuarios brasileiros. Plataforma completa com criacao de bots, conexao via QR Code ou codigo de 8 digitos (Baileys), builder visual de comandos drag-and-drop, planos em moedas, e pagamento via PIX (EFI Bank mock).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API client**: Orval (gerado de OpenAPI spec)
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, shadcn/ui, Wouter
- **Auth**: JWT (`jsonwebtoken` + `bcryptjs`), token em `localStorage` como `bot_token`
- **Build**: esbuild (CJS bundle)
- **Image processing**: sharp (WebP conversion for stickers)

## Artifacts

- `artifacts/api-server` — API REST (Express), porta via `$PORT`
- `artifacts/bot-aluguel-pro` — Frontend React (Vite), previewPath `/`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Features Implementadas

- Landing page animada (hero, features, pricing) em PT-BR
- Auth: cadastro/login via telefone + senha, JWT, 30 moedas boas-vindas
- Dashboard: stats (moedas, bots, plano ativo, mensagens), atividade recente
- Bots: listar, criar, deletar, gerenciar (QR Code / codigo de 8 digitos)
- Builder Visual: editor drag-and-drop de no-code com blocos (Comando, Acao, Condicao, Resposta)
  - Acoes: figurinha (sharp WebP), kick, ban, promote, demote, warn, mute/unmute grupo, abrir/fechar grupo, link do grupo, revogar link, hidetag, info grupo, anti-link, reagir, apagar mensagem, enviar imagem
  - Condicoes: e grupo, e privado, e admin, nao e admin, bot e admin, tem imagem/video/sticker/midia, contem link, contem texto, tem mencao, e reply
  - Campos condicionais: showWhen mostra campos extras conforme tipo selecionado
  - Dicas contextuais para cada tipo de acao/condicao
  - **Templates prontos**: 7 templates pre-configurados (Figurinha, Boas-Vindas, Moderacao, Anti-Link, Ferramentas de Grupo, Sistema de Avisos, Bot Completo) — usuario pode aplicar com 1 clique
  - **Drag from palette**: arrastar blocos da paleta direto pro canvas (mobile e desktop), ghost element durante drag
  - **Pinch-to-zoom fix**: 2 dedos detectados via touchCount global — cancela drag de bloco automaticamente
  - **Centralized gestures**: Canvas é o único dono de gestos — NodeCard é display-only (pointerEvents:none na div principal, auto nos botões/portas). Canvas detecta hit em nós via coordenadas mundiais e decide pan vs drag via threshold de 6px. Gesto travado até o dedo levantar.
  - **DOM-direct pan/zoom**: Pan e pinch-to-zoom manipulam CSS transform diretamente no DOM (transformDivRef), sem re-render React durante o gesto. Estado React sincronizado apenas no pointerup.
  - **Performance**: RAF throttle no handleMoveNode, will-change no container de transform e nodes
- WhatsApp: auto-reconnect de sessoes ao iniciar servidor (restoreSessions), sessoes persistentes em `.baileys-sessions/`
- Planos: Basico (100), Pro (250), Premium (500) moedas/30 dias
- Pagamentos: recarga PIX com codigo copia-e-cola, historico
- Admin: stats da plataforma, tabela de usuarios e pagamentos
- Tema dark neon: preto/cinza com roxo electrico (primary) e azul electrico (accent)

## Admin Credentials

- Telefone: `11999990000`, Senha: `admin123`

## Notas Importantes

- PIX: implementacao mock (sem cert EFI Bank real)
- Sticker: imagens convertidas para WebP 512x512 via sharp; video nao suportado
- Sessoes WhatsApp: salvas em `artifacts/api-server/.baileys-sessions/` (gitignored)
- 1 BRL = 100 moedas
- Planos hardcoded em `artifacts/api-server/src/routes/plans.ts`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
