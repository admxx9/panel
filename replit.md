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
- Planos: Basico (100), Pro (250), Premium (500) moedas/30 dias
- Pagamentos: recarga PIX com codigo copia-e-cola, historico
- Admin: stats da plataforma, tabela de usuarios e pagamentos
- Tema dark neon: preto/cinza com roxo electrico (primary) e azul electrico (accent)

## Admin Credentials

- Telefone: `11999990000`, Senha: `admin123`

## Notas Importantes

- PIX: implementacao mock (sem cert EFI Bank real)
- Bot connection: mock (sem Baileys real), QR code renderizado via api.qrserver.com
- 1 BRL = 100 moedas
- Planos hardcoded em `artifacts/api-server/src/routes/plans.ts`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
