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
  - **74+ tipos de acao** implementados no backend: menus (show_menu_photo/admin/games/owner), 12 jogos (moeda, dado, sorteio, amor, ship, nota, sorte, V/D, roleta, top5, rank, piada), moderacao completa (kick, ban, warn, reset_warns, promover, rebaixar, mutar, desmutar, apagar), grupo (fechar, abrir, info, link, revogar, nome, desc, membros, admins), dono (ligar, desligar, moedas, broadcast, bloquear, desbloquear), boas-vindas/despedida, enquete, CEP, calculadora, figurinha, hidetag, reagir, imagem
  - **16 variaveis** substituidas no backend: {nome}, {numero}, {user}, {grupo}, {membros}, {admins}, {moedas}, {plano}, {prefix}, {bot}, {data}, {hora}, {dono}, {args}, {quoted}, {botname}
  - **Permissoes de comando**: owner_only, admin_only, group_only, private_only aplicadas antes da execucao
  - **Bloco Condicao**: bloco logico com DUAS saidas (SIM/NAO). 28 tipos de condicao (grupo/privado, admin, dono, bot admin, midia, texto, mencao, reply, citacao, flood, tamanho msg, membros, horario, prefixo, plano, bot ligado). Fios coloridos: verde (SIM) e vermelho (NAO). Tags de categoria no card. Backend avalia condicao e direciona fluxo. Template "Comando so no Privado" incluso.
  - Campos condicionais: showWhen mostra campos extras conforme tipo selecionado
  - Dicas contextuais para cada tipo de acao/condicao
  - **Templates prontos**: 9 templates (Figurinha, Menu com Foto, Moderacao, Protecao Total, Sistema de Dono, Diversao, Ferramentas de Grupo, Mensagens Interativas, TUDO INCLUSO com 96+ blocos)
  - **Botao Limpar Tudo**: remove todos os blocos do canvas com confirmacao
  - **Drag from palette**: arrastar blocos da paleta direto pro canvas (mobile e desktop), ghost element durante drag
  - **Pinch-to-zoom fix**: 2 dedos detectados via touchCount global — cancela drag de bloco automaticamente
  - **Performance**: RAF throttle no handleMoveNode, will-change no container de transform e nodes
  - **Gestos mobile**: 1 dedo = pan, pinça = zoom, long-press 200ms + arrastar = mover bloco, feedback visual (outline roxo + scale) e vibração
  - **Bloco Resposta**: 6 tipos (texto, lista interativa, imagem, audio, localizacao, contato), variaveis ({nome}, {moedas}, etc.), botoes (max 3, reply/call), preview ao vivo no formulario, tags no card (tipo, botoes, preview)
  - **Bloco Botoes**: bloco separado para botoes interativos (3 tipos: normal max 3, lista interativa/menu, ligar). Conecta-se na saida de um bloco Resposta para decorar a mensagem. Preview ao vivo no formulario. Backend mescla botoes na mensagem da resposta. Cliques de botoes/listas parseados via buttonsResponseMessage/listResponseMessage.
  - Formato secoes lista: linhas sem pipe = titulo secao, linhas com pipe = id | titulo_row | descricao
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
