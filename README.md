# BotAluguel Pro — Como o App Funciona por Dentro

> Este documento explica como cada parte do aplicativo foi construída e **por que** as coisas funcionam do jeito que funcionam. É voltado para quem quer entender a lógica da programação sem precisar ser expert.

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [O que é TypeScript?](#2-o-que-é-typescript)
3. [O App Mobile (React Native)](#3-o-app-mobile-react-native)
4. [O Servidor (API Server)](#4-o-servidor-api-server)
5. [O Painel Web (Frontend)](#5-o-painel-web-frontend)
6. [Como o Login Funciona](#6-como-o-login-funciona)
7. [Como os Bots WhatsApp Funcionam](#7-como-os-bots-whatsapp-funcionam)
8. [Como o Sistema de Moedas e PIX Funciona](#8-como-o-sistema-de-moedas-e-pix-funciona)
9. [Como as Notificações Push Funcionam](#9-como-as-notificações-push-funcionam)
10. [O Banco de Dados](#10-o-banco-de-dados)
11. [Como uma Tela é Construída](#11-como-uma-tela-é-construída)
12. [Glossário de Termos](#12-glossário-de-termos)

---

## 1. Visão Geral da Arquitetura

O projeto é dividido em **4 peças separadas** que se comunicam entre si:

```
┌─────────────────┐        ┌─────────────────┐
│   App Mobile    │        │   Painel Web    │
│  (React Native) │        │     (React)     │
│  Android / iOS  │        │   Navegador     │
└────────┬────────┘        └────────┬────────┘
         │                          │
         │   Faz requisições HTTP   │
         │   (como pedir páginas    │
         │    da internet)          │
         ▼                          ▼
┌──────────────────────────────────────────┐
│              API Server                  │
│          (Node.js / Express)             │
│  ← O "cérebro" que processa tudo        │
└──────────────────┬───────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐    ┌────────────────────┐
│  Banco de     │    │  Serviço de Bots   │
│  Dados (SQL)  │    │  (Baileys/WhatsApp) │
│  PostgreSQL   │    │                    │
└───────────────┘    └────────────────────┘
```

**Por que separar assim?**
Porque cada peça pode ser atualizada, reiniciada ou escalada independentemente. Se o servidor de bots travar, o app continua funcionando. Se você quiser 10 mil usuários, você só aumenta o servidor — sem mexer no app.

---

## 2. O que é TypeScript?

Todo o projeto usa **TypeScript**, que é JavaScript com "etiquetas de tipo". Pensa assim:

```typescript
// JavaScript puro — você não sabe o que "usuario" contém
function saudar(usuario) {
  return "Olá " + usuario.nome;
}

// TypeScript — você define exatamente o que existe
type Usuario = {
  id: string;
  nome: string;
  moedas: number;
};

function saudar(usuario: Usuario) {
  return "Olá " + usuario.nome; // o editor já sabe que .nome existe
}
```

Isso evita erros. Se você tentar usar `usuario.email` e não existir, o TypeScript avisa antes de rodar.

---

## 3. O App Mobile (React Native)

### O que é React Native?

React Native é uma tecnologia que permite escrever **um único código** e gerar tanto o app Android quanto iOS. Em vez de aprender duas linguagens diferentes (Java/Kotlin para Android e Swift para iOS), você escreve tudo em TypeScript.

### Como as telas são organizadas

O app usa **Expo Router** para navegar entre telas. A ideia é simples: cada arquivo dentro da pasta `app/` vira uma tela:

```
app/
├── (auth)/
│   ├── login.tsx         → tela de login
│   └── register.tsx      → tela de cadastro
├── (tabs)/
│   ├── index.tsx         → aba Dashboard (tela inicial)
│   ├── bots.tsx          → aba Meus Bots
│   ├── payments.tsx      → aba Carteira
│   └── settings.tsx      → aba Configurações
├── bot/
│   └── [id].tsx          → tela de um bot específico
│                            (o [id] é dinâmico — muda conforme o bot)
└── builder/
    └── [id].tsx          → editor visual de fluxo do bot
```

O `[id]` entre colchetes significa que a rota é **dinâmica**. Quando você vai para `/bot/123`, o código recebe `id = "123"` e usa para buscar aquele bot específico.

### O que é um "componente"?

Toda tela e todo elemento visual é um **componente** — uma função que retorna o que deve aparecer na tela:

```typescript
// Um componente simples de botão
function MeuBotao({ texto, aoClicar }) {
  return (
    <Pressable onPress={aoClicar} style={estilos.botao}>
      <Text style={estilos.texto}>{texto}</Text>
    </Pressable>
  );
}

// Usando ele em outro lugar
<MeuBotao texto="Criar Bot" aoClicar={() => router.push("/bots")} />
```

Pensa em componentes como **blocos de LEGO** — você cria pequenos blocos reutilizáveis e monta telas inteiras com eles.

---

## 4. O Servidor (API Server)

### O que é uma API?

API é uma "janela de comunicação" entre o app e o servidor. O app faz **perguntas** (requisições) e o servidor responde com **dados**:

```
App pergunta:  GET /api/bots
Servidor responde: [{ id: "1", nome: "MeuBot", status: "connected" }]

App envia:     POST /api/bots  { nome: "NovoBot" }
Servidor responde: { id: "2", nome: "NovoBot", status: "offline" }
```

Existem 4 tipos de requisição (como verbos da língua):
- **GET** — buscar/ler alguma coisa
- **POST** — criar algo novo
- **PUT/PATCH** — atualizar algo existente
- **DELETE** — apagar algo

### Como o servidor está organizado

```
artifacts/api-server/src/
├── routes/
│   ├── auth.ts       → login, cadastro, logout
│   ├── bots.ts       → criar, listar, deletar bots
│   ├── payments.ts   → cobranças PIX, histórico
│   ├── admin.ts      → painel do administrador
│   └── users.ts      → perfil, atualizar dados
├── lib/
│   ├── expoPush.ts   → enviar notificações push
│   ├── db.ts         → conexão com banco de dados
│   └── pix.ts        → integração com EFI Bank (PIX)
└── index.ts          → ponto de entrada, configura o servidor
```

Cada arquivo de rota define o que acontece quando o app faz uma requisição:

```typescript
// routes/bots.ts (simplificado)
router.get("/bots", verificarLogin, async (req, res) => {
  // req = a requisição que chegou
  // res = a resposta que vamos enviar de volta

  const bots = await db.query.bots.findMany({
    where: eq(bots.userId, req.user.id) // só os bots desse usuário
  });

  res.json(bots); // envia a lista como JSON
});
```

### O que é Middleware?

Middleware é código que **roda antes** da resposta principal. Por exemplo, `verificarLogin` é um middleware:

```typescript
function verificarLogin(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ erro: "Não autenticado" });
  }

  // verifica o token e coloca o usuário na requisição
  req.user = verificarToken(token);
  next(); // passa para a próxima função
}
```

É como um segurança na porta — se não tiver token, não entra.

---

## 5. O Painel Web (Frontend)

O painel web usa **React + Vite**. React é a mesma base do app mobile (React Native), mas para navegadores. Vite é a ferramenta que transforma o código TypeScript em arquivos que o navegador entende.

A estrutura de pastas segue a mesma lógica: componentes, páginas, e uma camada de comunicação com a API.

---

## 6. Como o Login Funciona

### O fluxo completo

```
1. Usuário digita email e senha no app
        ↓
2. App envia para: POST /api/auth/login
        ↓
3. Servidor verifica:
   - Email existe no banco?
   - Senha bate com o hash armazenado?
        ↓
4. Se sim → servidor gera um TOKEN (string aleatória)
        ↓
5. App salva o token no AsyncStorage (memória do celular)
        ↓
6. Toda requisição futura inclui esse token no cabeçalho
```

### O que é o Token (JWT)?

JWT (JSON Web Token) é como uma **pulseira de parque de diversões** — você pega uma vez e mostra em todas as atrações sem precisar comprar ingresso de novo.

O token tem 3 partes separadas por ponto:

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.assinatura
      CABEÇALHO              DADOS               ASSINATURA
```

A **assinatura** garante que ninguém falsificou o token. O servidor tem uma chave secreta, e se alguém tentar criar um token falso, a assinatura não bate.

### O que é o AuthContext?

O `AuthContext.tsx` é um "cofre global" que guarda as informações do usuário logado. Qualquer tela do app pode acessar sem precisar passar os dados manualmente:

```typescript
// No AuthContext:
const AuthContext = createContext(null);

// Qualquer tela pode usar:
function MinhasTela() {
  const { user, signOut } = useAuth();
  return <Text>Olá, {user.name}!</Text>;
}
```

Isso é o padrão **Context API** do React — um "estado global" que qualquer componente pode ler.

### Onde os dados ficam salvos no celular?

O `AsyncStorage` é como um "bloco de notas" do celular:

```typescript
// Salvar
await AsyncStorage.setItem("auth_token", "meu_token_aqui");

// Ler
const token = await AsyncStorage.getItem("auth_token");

// Apagar (logout)
await AsyncStorage.removeItem("auth_token");
```

Fica salvo mesmo depois de fechar o app. É por isso que você não precisa fazer login toda vez.

---

## 7. Como os Bots WhatsApp Funcionam

### A tecnologia por trás: Baileys

O **Baileys** é uma biblioteca que simula ser um WhatsApp Web. Ela se conecta aos servidores do WhatsApp como se fosse o app normal, mas de forma programática (pelo código).

### O processo de conexão

```
1. Você cria um bot no app
        ↓
2. O servidor inicia uma instância Baileys
        ↓
3. Baileys gera um QR Code (ou Pair Code)
        ↓
4. Você escaneia com o WhatsApp do celular
        ↓
5. O WhatsApp "pensa" que você abriu num computador
        ↓
6. A partir daí, o bot recebe e envia mensagens
```

### Como o bot responde mensagens

O bot tem um **fluxo** que você configura no Builder Visual. Na prática, quando uma mensagem chega:

```typescript
// Simplificado:
conexao.on("messages.upsert", async ({ messages }) => {
  const mensagem = messages[0];
  const texto = mensagem.message?.conversation;

  // Percorre os comandos cadastrados
  for (const comando of fluxo.comandos) {
    if (texto === comando.gatilho) {
      // Executa a ação configurada
      await conexao.sendMessage(
        mensagem.key.remoteJid,
        { text: comando.resposta }
      );
    }
  }
});
```

O Builder Visual que você usa no app gera esse "fluxo" de forma visual — você arrasta os blocos e o código por trás monta a lógica.

---

## 8. Como o Sistema de Moedas e PIX Funciona

### O fluxo de compra

```
1. Usuário escolhe um pacote de moedas no app
        ↓
2. App chama: POST /api/payments/create-charge
        ↓
3. Servidor chama a API da EFI Bank (banco digital)
        ↓
4. EFI Bank retorna:
   - Um QR Code PIX
   - Um código copia-e-cola
        ↓
5. Usuário paga
        ↓
6. EFI Bank envia um "webhook" para o servidor
   (webhook = o banco "liga" para o servidor avisando que pagou)
        ↓
7. Servidor adiciona as moedas na conta do usuário
```

### O que é um Webhook?

Webhook é quando **outro sistema te avisa** em vez de você ficar perguntando. Imagina:

- **Sem webhook** (ruim): você pergunta ao banco a cada segundo "já pagou? já pagou? já pagou?"
- **Com webhook** (bom): o banco te liga quando o pagamento confirmar

```typescript
// O servidor "escuta" chamadas do banco
router.post("/webhook/pix", verificarAssinatura, async (req, res) => {
  const { status, txid } = req.body;

  if (status === "CONCLUIDA") {
    // Busca qual compra era essa
    const compra = await db.query.payments.findFirst({
      where: eq(payments.txid, txid)
    });

    // Adiciona moedas ao usuário
    await db.update(users)
      .set({ coins: sql`coins + ${compra.coins}` })
      .where(eq(users.id, compra.userId));
  }

  res.json({ ok: true }); // avisa o banco que recebeu
});
```

---

## 9. Como as Notificações Push Funcionam

### O problema sem push

Sem notificação push, para saber se tem mensagem nova você precisaria ficar abrindo o app manualmente. Com push, o servidor **acorda** o app mesmo com ele fechado.

### A cadeia completa

```
Evento acontece (ex: bot desconectou)
        ↓
Servidor busca o token FCM do usuário no banco
        ↓
Servidor chama Firebase (Google) com o token e a mensagem
        ↓
Firebase entrega no celular do usuário
        ↓
Android exibe a notificação
```

### O que é o Token FCM?

É o "endereço" do celular para o Google entregar notificações. Cada celular tem um token único. O app pede esse token ao Android e manda para o servidor salvar:

```typescript
// hooks/usePushNotifications.ts (simplificado)
async function getFcmPushToken() {
  // Pede permissão ao usuário
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;

  // Pede o token único do celular
  const deviceToken = await Notifications.getDevicePushTokenAsync();
  return deviceToken.data; // string longa como "dkp3x9..."
}
```

Quando o app abre e o usuário está logado, esse token é enviado para o servidor e salvo no banco de dados vinculado ao usuário.

### Por que usamos Firebase Admin SDK direto?

O Expo tinha um serviço intermediário de push, mas ele usava a API legada do Google que foi desativada. Migramos para o **Firebase Admin SDK**, que usa a API nova (FCM v1) e funciona direto — sem intermediários:

```typescript
// lib/expoPush.ts (simplificado)
import admin from "firebase-admin";

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

export async function enviarNotificacao(token: string, titulo: string, corpo: string) {
  await admin.messaging().send({
    token,             // endereço do celular
    notification: { title: titulo, body: corpo },
    android: { priority: "high" }
  });
}
```

---

## 10. O Banco de Dados

### O que é SQL?

SQL é uma linguagem para guardar e buscar dados de forma organizada em **tabelas**, como uma planilha:

```
Tabela: users
┌────┬──────────┬───────────────────────┬────────┐
│ id │  name    │         email         │ coins  │
├────┼──────────┼───────────────────────┼────────┤
│  1 │ João     │ joao@email.com        │  150   │
│  2 │ Maria    │ maria@email.com       │   30   │
└────┴──────────┴───────────────────────┴────────┘

Tabela: bots
┌────┬──────────┬──────────┬───────────┐
│ id │  name    │ user_id  │  status   │
├────┼──────────┼──────────┼───────────┤
│  1 │ MeuBot   │    1     │ connected │
│  2 │ BotVenda │    1     │ offline   │
└────┴──────────┴──────────┴───────────┘
```

O campo `user_id` na tabela de bots é uma **chave estrangeira** — aponta para o `id` da tabela de usuários. Assim sabemos que "MeuBot" e "BotVenda" pertencem ao João.

### O que é Drizzle ORM?

ORM é uma ferramenta que traduz TypeScript para SQL. Em vez de escrever SQL "na mão":

```sql
-- SQL puro (difícil de manter)
SELECT * FROM bots WHERE user_id = 1 AND status = 'connected';
```

Você escreve em TypeScript:

```typescript
// Drizzle ORM (mais seguro e legível)
const bots = await db.query.bots.findMany({
  where: and(
    eq(bots.userId, 1),
    eq(bots.status, "connected")
  )
});
```

O Drizzle converte isso para SQL automaticamente e retorna os dados já tipados.

---

## 11. Como uma Tela é Construída

Vamos dissecar a **tela do Dashboard** para entender o padrão usado em todo o app:

```typescript
export default function DashboardScreen() {

  // 1. DADOS DO USUÁRIO LOGADO
  // useAuth() lê do AuthContext — o "cofre global"
  const { user } = useAuth();

  // 2. BUSCA DADOS DO SERVIDOR
  // useGetDashboardStats() faz GET /api/dashboard/stats
  // enquanto carrega: isLoading=true, data=undefined
  // quando chega:     isLoading=false, data={totalBots:2, ...}
  const { data, isLoading, isError, refetch } = useGetDashboardStats();

  // 3. ESTADO LOCAL DA TELA
  // useState guarda informações que só essa tela precisa
  const [showCta, setShowCta] = useState(false);

  // 4. EFEITOS — código que roda quando algo muda
  // useEffect com [] roda UMA VEZ quando a tela abre
  useEffect(() => {
    AsyncStorage.getItem("ONBOARDING_SEEN").then((visto) => {
      if (visto) setShowCta(true);
    });
  }, []);

  // 5. O QUE APARECE NA TELA
  return (
    <ScrollView
      refreshControl={
        // Puxar para baixo chama refetch() — busca dados novos
        <RefreshControl onRefresh={refetch} />
      }
    >
      {isLoading ? (
        <SkeletonLoader />          // mostra "esqueleto" enquanto carrega
      ) : isError ? (
        <ErrorView onRetry={refetch} /> // mostra erro se falhou
      ) : (
        <View>
          <Text>Bots Ativos: {data.activeBots}</Text>
          {/* ... resto da tela */}
        </View>
      )}
    </ScrollView>
  );
}
```

Esse padrão se repete em TODAS as telas:
1. Pega dados do usuário (contexto)
2. Busca dados do servidor (query)
3. Guarda estado local se precisar
4. Efeitos para ações automáticas
5. Retorna o visual com os 3 estados: carregando / erro / sucesso

---

## 12. Glossário de Termos

| Termo | O que é |
|-------|---------|
| **TypeScript** | JavaScript com tipos — evita erros antes de rodar |
| **React / React Native** | Biblioteca para criar telas com componentes |
| **Expo** | Ferramenta que facilita criar apps React Native |
| **API** | "Janela" de comunicação entre app e servidor |
| **REST** | Padrão de API usando GET, POST, PUT, DELETE |
| **JWT** | Token de autenticação — "pulseira digital" |
| **AsyncStorage** | Bloco de notas do celular (dados persistentes) |
| **Context API** | Estado global compartilhado entre telas |
| **Hook** | Função especial do React que começa com `use` |
| **useState** | Hook para guardar dados que mudam na tela |
| **useEffect** | Hook para rodar código quando algo acontece |
| **PostgreSQL** | Banco de dados usado no projeto |
| **Drizzle ORM** | Traduz TypeScript para SQL automaticamente |
| **Webhook** | Outro sistema te avisa em vez de você perguntar |
| **FCM** | Firebase Cloud Messaging — serviço de push do Google |
| **Token FCM** | "Endereço" do celular para receber notificações |
| **Middleware** | Código que roda antes da resposta principal |
| **Build (APK)** | Processo de compilar o código em um arquivo instalável |
| **EAS** | Expo Application Services — serviço de build na nuvem |
| **PIX** | Sistema de pagamento instantâneo brasileiro |
| **EFI Bank** | Banco digital usado para processar cobranças PIX |
| **Baileys** | Biblioteca que conecta ao WhatsApp de forma programática |
| **Mono-repo** | Um único repositório com vários projetos (mobile, web, api) |
| **pnpm** | Gerenciador de pacotes — instala bibliotecas externas |

---

*Este app foi construído com: TypeScript, React Native, Expo, Node.js, Express, PostgreSQL, Drizzle ORM, Firebase Admin SDK, Baileys e EFI Bank.*
