// 🤖 BotAluguel — Sistema de Aluguel de Bot WhatsApp

// ========== MÓDULOS ==========
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  proto
} = require("baileys");
const fs       = require('fs');
const crypto   = require('crypto');
const { Boom } = require('@hapi/boom');
const NodeCache = require("node-cache");
const readline  = require("readline");
const pino      = require('pino');
const chalk     = require('chalk');
const { v4: uuidv4 } = require('uuid');
const { sendButtons, sendInteractiveMessage } = require('./buttons');
const EfiBankPix = require('./efipay');

// ========== BANNER ==========
console.log(chalk.cyanBright("🤖 BOTALUGUEL — Sistema de Aluguel via WhatsApp"));
console.log(chalk.cyan("═".repeat(50)));

// ========== CONFIG ==========
const prefixos = ['.', '!', '/', '#'];
const sleep    = ms => new Promise(r => setTimeout(r, ms));
let botAtivo   = true;

let dono = process.env.DONO || "5511999999999";
dono = dono.replace(/\D/g, '') + "@s.whatsapp.net";

// ========== EFI BANK (INTACTO) ==========
let efipay = null, efipayReady = false;
const EFI_CLIENT_ID     = process.env.EFI_CLIENT_ID     || 'Client_Id_c5402771eee923060261f03590f4d8b82ce4b88c';
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET || 'Client_Secret_345bde04a214ac7e2464bbbb73b08b161ecfc2af';
const EFI_SANDBOX       = false;
const EFI_PIX_KEY       = process.env.EFI_PIX_KEY       || 'a45331e2-840e-41dc-bc93-8f1bd2b6fd91';
const EFI_CERT_PATH     = './certificado.p12';

if (EFI_CLIENT_ID !== 'SEU_CLIENT_ID_AQUI') {
  try {
    efipay = new EfiBankPix({
      client_id: EFI_CLIENT_ID, client_secret: EFI_CLIENT_SECRET,
      sandbox: EFI_SANDBOX, certificate: EFI_CERT_PATH
    });
    efipayReady = true;
    console.log(chalk.green(`✅ Efí Bank — modo: ${EFI_SANDBOX ? 'SANDBOX' : 'PRODUÇÃO'}`));
  } catch (err) { console.log(chalk.red("❌ Efí Bank:"), err.message); }
}

// ========== PLANOS (valores de teste: 1 moeda) ==========
const PLANOS = {
  basico:  { id: 'basico',  nome: '⭐ Básico',  moedas: 1, dias: 30, maxGrupos: 1  },
  pro:     { id: 'pro',     nome: '💎 Pro',      moedas: 1, dias: 30, maxGrupos: 5  },
  premium: { id: 'premium', nome: '👑 Premium',  moedas: 1, dias: 30, maxGrupos: -1 }
};
// 1 BRL = 100 moedas — R$ 0,01 = 1 moeda
const BRL_POR_MOEDA = 0.01;

// ========== DATABASE ==========
const DB    = './database';
const PATHS = {
  usuarios:     `${DB}/usuarios.json`,
  grupos:       `${DB}/grupos.json`,
  planosAtivos: `${DB}/planos_ativos.json`,
  pagamentos:   `${DB}/pagamentos.json`
};

function initDB() {
  if (!fs.existsSync(DB)) fs.mkdirSync(DB, { recursive: true });
  for (const p of Object.values(PATHS)) {
    if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify([], null, 2));
  }
}

const lerDB    = p => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return []; } };
const salvarDB = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));
const hashSenha = s => crypto.createHash('sha256').update(String(s)).digest('hex');

// ========== USUÁRIOS ==========
function getUser(userId) { return lerDB(PATHS.usuarios).find(u => u.id === userId) || null; }

function createUser(userId, nome) {
  const users = lerDB(PATHS.usuarios);
  if (users.find(u => u.id === userId)) return false;
  users.push({ id: userId, nome, moedas: 30, senha: null, criadoEm: new Date().toISOString() });
  salvarDB(PATHS.usuarios, users);
  return true;
}

function getMoedas(userId) { const u = getUser(userId); return u ? (u.moedas ?? 0) : 0; }

function addMoedas(userId, qtd) {
  const users = lerDB(PATHS.usuarios);
  const i = users.findIndex(u => u.id === userId);
  if (i === -1) return 0;
  users[i].moedas = (users[i].moedas ?? 0) + qtd;
  salvarDB(PATHS.usuarios, users);
  return users[i].moedas;
}

function remMoedas(userId, qtd) {
  const users = lerDB(PATHS.usuarios);
  const i = users.findIndex(u => u.id === userId);
  if (i === -1 || (users[i].moedas ?? 0) < qtd) return false;
  users[i].moedas -= qtd;
  salvarDB(PATHS.usuarios, users);
  return true;
}

function setSenha(userId, senha) {
  const users = lerDB(PATHS.usuarios);
  const i = users.findIndex(u => u.id === userId);
  if (i === -1) return false;
  users[i].senha = hashSenha(senha);
  salvarDB(PATHS.usuarios, users);
  return true;
}

function validarSenha(userId, senha) {
  const u = getUser(userId);
  if (!u) return false;
  if (!u.senha) return true; // sem senha: acesso livre (backward compat)
  return u.senha === hashSenha(senha);
}

// ========== PLANOS ATIVOS ==========
function getPlanoAtivo(userId) {
  const planos = lerDB(PATHS.planosAtivos);
  const p = planos.find(p => p.userId === userId && p.status === 'ativo');
  if (!p) return null;
  if (new Date(p.expiraEm) <= new Date()) {
    const arr = lerDB(PATHS.planosAtivos);
    const idx = arr.findIndex(x => x.userId === userId && x.status === 'ativo');
    if (idx !== -1) { arr[idx].status = 'expirado'; salvarDB(PATHS.planosAtivos, arr); }
    return null;
  }
  return p;
}

function ativarPlano(userId, planKey) {
  const plano = PLANOS[planKey];
  if (!plano) return false;
  if (!remMoedas(userId, plano.moedas)) return false;
  const arr = lerDB(PATHS.planosAtivos);
  arr.forEach(p => { if (p.userId === userId && p.status === 'ativo') p.status = 'expirado'; });
  const expiraEm = new Date();
  expiraEm.setDate(expiraEm.getDate() + plano.dias);
  arr.push({
    id: uuidv4(), userId, plano: planKey, nomePlano: plano.nome,
    status: 'ativo', maxGrupos: plano.maxGrupos,
    ativadoEm: new Date().toISOString(), expiraEm: expiraEm.toISOString(),
    notificado48h: false, notificado24h: false
  });
  salvarDB(PATHS.planosAtivos, arr);
  return true;
}

// ========== GRUPOS ==========
function getGrupo(groupId) { return lerDB(PATHS.grupos).find(g => g.id === groupId) || null; }
function getGruposDoUsuario(userId) { return lerDB(PATHS.grupos).filter(g => g.dono === userId); }

function addGrupo(groupId, userId, nomeGrupo) {
  const grupos = lerDB(PATHS.grupos);
  if (grupos.find(g => g.id === groupId)) return;
  grupos.push({
    id: groupId, dono: userId, nomeGrupo: nomeGrupo || groupId,
    status: 'inativo', aguardandoAdmin: true, adminRecebido: false,
    adicionadoEm: new Date().toISOString()
  });
  salvarDB(PATHS.grupos, grupos);
}

function updateGrupo(groupId, campos) {
  const grupos = lerDB(PATHS.grupos);
  const i = grupos.findIndex(g => g.id === groupId);
  if (i === -1) return;
  Object.assign(grupos[i], campos);
  salvarDB(PATHS.grupos, grupos);
}

function countGruposAtivos(userId) {
  return lerDB(PATHS.grupos).filter(g => g.dono === userId && g.status === 'ativo').length;
}

// ========== PIX — RECARGA ==========
async function gerarRecargaPix(userId, valorBRL) {
  if (!efipayReady) return { error: "PIX não configurado." };
  const moedas = Math.floor(valorBRL / BRL_POR_MOEDA);
  try {
    const cob = await efipay.pixCreateImmediateCharge({
      calendario: { expiracao: 3600 },
      valor: { original: valorBRL.toFixed(2) },
      chave: EFI_PIX_KEY,
      solicitacaoPagador: `BotAluguel — ${moedas} moedas — ${userId.split('@')[0]}`
    });
    if (!cob?.txid) return { error: "Resposta inválida da Efí" };
    const qr = await efipay.pixGenerateQRCode(cob.loc?.id);
    const pag = {
      txid: cob.txid, userId, tipo: 'recarga', moedas, valor: valorBRL,
      status: 'pendente', criadoEm: new Date().toISOString(),
      expiraEm: new Date(Date.now() + 3600000).toISOString(),
      qrCodeBase64: qr.imagemQrcode, copiaCola: qr.qrcode
    };
    const pags = lerDB(PATHS.pagamentos); pags.push(pag); salvarDB(PATHS.pagamentos, pags);
    return pag;
  } catch (err) { return { error: err.message }; }
}

async function verificarRecargaPix(txid) {
  if (!efipayReady) return { status: 'erro' };
  try {
    const res = await efipay.pixDetailCharge(txid);
    if (res.status === 'CONCLUIDA') {
      const pags = lerDB(PATHS.pagamentos);
      const i = pags.findIndex(p => p.txid === txid);
      if (i !== -1 && pags[i].status !== 'pago') {
        pags[i].status = 'pago'; pags[i].pagoEm = new Date().toISOString();
        salvarDB(PATHS.pagamentos, pags);
        addMoedas(pags[i].userId, pags[i].moedas);
        return { status: 'pago', moedas: pags[i].moedas, userId: pags[i].userId };
      }
    }
    return { status: res.status === 'ATIVA' ? 'pendente' : 'expirado' };
  } catch { return { status: 'erro' }; }
}

function monitorarPix(txid, from, sock) {
  let t = 0;
  const iv = setInterval(async () => {
    if (++t > 240) return clearInterval(iv);
    try {
      const r = await verificarRecargaPix(txid);
      if (r.status === 'pago') {
        clearInterval(iv);
        await sock.sendMessage(from, {
          text: `✅ *PAGAMENTO CONFIRMADO!*\n\n💰 *+${r.moedas} moedas* adicionadas!\n🪙 Novo saldo: *${getMoedas(r.userId)} moedas*\n\nUse *.planos* para comprar um plano.`
        });
      }
    } catch {}
  }, 15000);
}

// ========== NOTIFICAÇÕES DE EXPIRAÇÃO ==========
async function verificarExpiracoes(sock) {
  const planos = lerDB(PATHS.planosAtivos).filter(p => p.status === 'ativo');
  const agora  = Date.now();
  for (const p of planos) {
    const restante = new Date(p.expiraEm).getTime() - agora;
    const h48 = 48 * 3600000;
    const h24 = 24 * 3600000;
    if (!p.notificado48h && restante > 0 && restante <= h48) {
      await sock.sendMessage(p.userId, {
        text: `⚠️ *AVISO — Plano expirando!*\n\nSeu plano *${p.nomePlano}* expira em *menos de 48 horas*.\n\nRenove com *.planos* para continuar. 🤖`
      });
      const arr = lerDB(PATHS.planosAtivos);
      const idx = arr.findIndex(x => x.id === p.id);
      if (idx !== -1) { arr[idx].notificado48h = true; salvarDB(PATHS.planosAtivos, arr); }
    }
    if (!p.notificado24h && restante > 0 && restante <= h24) {
      await sock.sendMessage(p.userId, {
        text: `🚨 *URGENTE — Plano expira em 24h!*\n\nSeu plano *${p.nomePlano}* expira amanhã!\n\nRenove agora com *.planos*. ⏰`
      });
      const arr = lerDB(PATHS.planosAtivos);
      const idx = arr.findIndex(x => x.id === p.id);
      if (idx !== -1) { arr[idx].notificado24h = true; salvarDB(PATHS.planosAtivos, arr); }
    }
  }
}

// ========== FLUXOS PENDENTES ==========
const aguardandoLink   = new Map();
const aguardandoSenha  = new Map();

// ========== HELPERS ==========
function formatarTempo(expiraEm) {
  const diff = new Date(expiraEm).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const dias  = Math.floor(diff / 86400000);
  const horas = Math.floor((diff % 86400000) / 3600000);
  if (dias > 0) return `${dias}d ${horas}h`;
  return `${horas}h`;
}

// ========== ENVIAR LIST MESSAGE (padrão 1 botão → caixa de opções) ==========
// Usa single_select (native flow) — formato moderno que funciona em contas pessoais
async function sendList(sock, jid, { title, text, footer, buttonText, sections }, quoted) {

  // Monta as seções no formato do single_select
  const sectionsFmt = sections.map(s => ({
    title: s.title || '',
    rows:  (s.rows || []).map(r => ({
      id:          r.id,
      title:       r.title,
      description: r.description || ''
    }))
  }));

  const singleSelectParams = {
    title:    buttonText || 'VER OPÇÕES',
    sections: sectionsFmt
  };

  // ── Tentativa 1: single_select via sendInteractiveMessage (formato nativo moderno) ──
  try {
    return await sendInteractiveMessage(sock, jid, {
      text:   text  || ' ',
      footer: footer || '',
      title:  title || '',
      interactiveButtons: [{
        name:             'single_select',
        buttonParamsJson: JSON.stringify(singleSelectParams)
      }]
    }, quoted ? { quoted } : {});
  } catch (err1) {
    console.warn(chalk.yellow('[LIST] single_select falhou:'), err1.message);
  }

  // ── Tentativa 2: listMessage proto (formato legado, funciona em Business) ──
  try {
    const sectionsFmtProto = sectionsFmt.map(s => ({
      title: s.title,
      rows:  s.rows.map(r => ({ rowId: r.id, title: r.title, description: r.description }))
    }));
    const listContent = {
      listMessage: proto.Message.ListMessage.create({
        title:       title || '',
        description: text  || '',
        footerText:  footer || '',
        buttonText:  (buttonText || 'VER OPÇÕES').toUpperCase(),
        listType:    proto.Message.ListMessage.ListType.SINGLE_SELECT,
        sections:    sectionsFmtProto
      })
    };
    const userJid = sock.user?.id || '';
    const msg = await generateWAMessageFromContent(jid, listContent, quoted ? { userJid, quoted } : { userJid });
    await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
    return msg;
  } catch (err2) {
    console.warn(chalk.yellow('[LIST] listMessage falhou:'), err2.message);
  }

  // ── Fallback final: texto formatado numerado (sempre funciona) ──
  try {
    let num = 0;
    const linhas = sections.flatMap(s =>
      (s.rows || []).map(r => `*${++num}.* ${r.title}${r.description ? ` — _${r.description}_` : ''}`)
    );
    const textoFinal =
      `*${title}*\n` +
      `${'─'.repeat(26)}\n\n` +
      `${text}\n\n` +
      linhas.join('\n') +
      (footer ? `\n\n_${footer}_` : '');
    return await sock.sendMessage(jid, { text: textoFinal }, quoted ? { quoted } : {});
  } catch (err3) {
    console.error(chalk.red('[LIST FALLBACK ERRO]'), err3.message);
  }
}

// ========== ENVIAR CONFIRMAÇÃO DE ADMIN (lista com 1 opção) ==========
// Usa sendList para ser mais confiável que botões quick_reply
async function sendAdminConfirmList(sock, jid, groupId, nomeGrupo) {
  return sendList(sock, jid, {
    title: '⚠️ Aguardando cargo de admin',
    text:
      `🏠 Grupo: *${nomeGrupo || groupId}*\n\n` +
      `Após me promover a administrador no grupo, confirme clicando abaixo.\n\n` +
      `_Vá ao grupo → Participantes → Me selecione → Tornar admin_`,
    footer: 'BotAluguel — verificação manual',
    buttonText: '👉 CONFIRMAR ADMIN',
    sections: [{
      title: 'Ação necessária',
      rows: [
        {
          id: `verificar_admin_${groupId}`,
          title: '✅ Confirmar que virei administrador',
          description: 'Clique após ser promovido a admin no grupo'
        }
      ]
    }]
  });
}

// ========== NOTIFICAR ADMIN RECEBIDO ==========
async function notificarAdminRecebido(sock, groupId) {
  try {
    const grupo = getGrupo(groupId);
    updateGrupo(groupId, { aguardandoAdmin: false, adminRecebido: true });

    // Notifica no grupo
    await sock.sendMessage(groupId, {
      text: `✅ *BotAluguel — Recebi cargo de admin!*\n\n🤖 Agora o responsável deve me ativar no privado com:\n*.ativar ${groupId}*`
    });

    // Notifica o dono no privado
    const donoId = grupo?.dono;
    if (donoId) {
      await sock.sendMessage(donoId, {
        text: `🎉 *Admin confirmado!*\n\n🏠 Grupo: *${grupo?.nomeGrupo || groupId}*\n✅ Já sou administrador!\n\nEnvie para ativar o bot:`
      });
      await sleep(500);
      await sendList(sock, donoId, {
        title: '✅ Bot pronto para ativar',
        text:  `Grupo: *${grupo?.nomeGrupo || groupId}*`,
        footer: 'BotAluguel',
        buttonText: 'O QUE DESEJA FAZER',
        sections: [{
          title: 'Próximos passos',
          rows: [
            { id: `.ativar ${groupId}`, title: '🚀 Ativar o bot agora', description: 'Ativar bot neste grupo' },
            { id: '.grupos',            title: '🏠 Ver meus grupos',    description: 'Lista de grupos' },
            { id: '.planos',            title: '📦 Ver planos',         description: 'Gerenciar planos' }
          ]
        }]
      });
    }

    console.log(chalk.green(`[ADMIN] Notificação OK → ${groupId}`));
  } catch (err) {
    console.error(chalk.red("[ADMIN NOTIFY ERRO]"), err.message);
  }
}

// ========== VERIFICAR ADMIN NO GRUPO (manual pelo botão) ==========
async function verificarAdminNoGrupo(sock, groupId, from) {
  try {
    const meta = await sock.groupMetadata(groupId);
    const botJidBase = sock.user?.id?.split(':')[0];
    const isAdmin = meta.participants.some(p =>
      (p.id.split('@')[0] === botJidBase) &&
      (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (isAdmin) {
      await notificarAdminRecebido(sock, groupId);
    } else {
      const nomeGrupo = getGrupo(groupId)?.nomeGrupo || groupId;
      await sock.sendMessage(from, {
        text: `❌ *Ainda não sou admin neste grupo.*\n\n🏠 *${nomeGrupo}*\n\nPeça a um administrador para me promover e clique novamente.`
      });
      await sleep(600);
      await sendAdminConfirmList(sock, from, groupId, nomeGrupo);
    }
  } catch (err) {
    await sock.sendMessage(from, {
      text: `⚠️ Não consegui verificar admin: ${err.message}\n\nVerifique se ainda estou no grupo e tente novamente.`
    });
  }
}

// ========== BOT PRINCIPAL ==========
async function iniciarBot() {
  console.log(chalk.cyanBright("\n🤖 Iniciando BotAluguel..."));
  initDB();

  const { state, saveCreds } = await useMultiFileAuthState("./sessao");
  const { version }          = await fetchLatestBaileysVersion();
  const msgRetryCounterCache = new NodeCache();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: state.keys },
    markOnlineOnConnect: true,
    msgRetryCounterCache
  });

  if (!sock.authState.creds.registered) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const q  = t => new Promise(r => rl.question(t, r));
    let num  = await q(chalk.cyan("📱 Número com DDI (ex: 5511999999999): "));
    rl.close();
    num = num.replace(/\D/g, "");
    if (!num) { console.log(chalk.red("❌ Número inválido.")); process.exit(1); }
    try {
      const code = await sock.requestPairingCode(num);
      console.log(chalk.bgGreen.black("\n✅ CÓDIGO:"), chalk.white.bold(code));
      console.log(chalk.yellow("WhatsApp > Config > Aparelhos conectados > Conectar com código\n"));
    } catch (err) { console.error(chalk.red("❌ Erro:"), err.message); process.exit(1); }
  }

  setInterval(() => verificarExpiracoes(sock).catch(() => {}), 6 * 60 * 60 * 1000);

  // ========== CONEXÃO ==========
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) { console.log(chalk.red("❌ Sessão encerrada.")); process.exit(0); }
      else { console.log(chalk.yellow("⚠️ Reconectando em 3s...")); setTimeout(iniciarBot, 3000); }
    } else if (connection === "open") {
      console.log(chalk.greenBright("✅ BotAluguel conectado!"));
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ========== DETECÇÃO DE ADMIN — Evento group-participants.update ==========
  sock.ev.on("group-participants.update", async (update) => {
    try {
      const { id: groupId, participants, action } = update;
      if (action !== 'promote') return;
      const botBase = sock.user?.id?.split(':')[0];
      const foiPromovido = participants.some(p => p.split('@')[0] === botBase);
      if (!foiPromovido) return;
      console.log(chalk.green(`[ADMIN EVT] Promovido no grupo: ${groupId}`));
      await notificarAdminRecebido(sock, groupId);
    } catch (err) {
      console.error(chalk.red("[ADMIN EVT ERRO]"), err.message);
    }
  });

  // ========== MENSAGENS ==========
  sock.ev.on("messages.upsert", async (mensagem) => {
    try {
      const info = mensagem.messages[0];
      if (!info.message && !info.messageStubType) return;
      if (info.key.remoteJid === "status@broadcast") return;
      if (info.key.fromMe) return;

      const from   = info.key.remoteJid;
      const ehGrupo = from.endsWith('@g.us');
      const sender  = ehGrupo ? info.key.participant : from;
      const nome    = info.pushName || "Usuário";

      // ========== DETECÇÃO DE ADMIN — messageStubType 29 (PROMOTE) ==========
      if (ehGrupo && info.messageStubType === 29) {
        const botBase   = sock.user?.id?.split(':')[0];
        const promovido = info.messageStubParameters?.[0] || '';
        if (promovido.split('@')[0] === botBase) {
          console.log(chalk.green(`[ADMIN STUB] Promovido via stub no grupo: ${from}`));
          await notificarAdminRecebido(sock, from);
        }
        return;
      }

      if (!info.message) return;

      // ========== EXTRAIR CONTEÚDO (texto, botão, lista, interativo) ==========
      let conteudo =
        info.message?.conversation ||
        info.message?.extendedTextMessage?.text ||
        info.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        info.message?.buttonsResponseMessage?.selectedButtonId ||
        info.message?.templateButtonReplyMessage?.selectedId || '';

      if (!conteudo && info.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try { conteudo = JSON.parse(info.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id || ''; } catch {}
      }

      if (!conteudo) return;

      const enviar  = t => sock.sendMessage(from, { text: t }, { quoted: info });
      const reagir  = e => sock.sendMessage(from, { react: { text: e, key: info.key } });
      const digitar = async (ms = 1000) => {
        await sock.sendPresenceUpdate('composing', from);
        await sleep(ms);
        await sock.sendPresenceUpdate('paused', from);
      };

      // ========== VERIFICAÇÃO DE ADMIN MANUAL (botão no privado) ==========
      if (!ehGrupo && conteudo.startsWith('verificar_admin_')) {
        const groupId = conteudo.replace('verificar_admin_', '');
        await reagir('🔍');
        await digitar(800);
        await verificarAdminNoGrupo(sock, groupId, from);
        return;
      }

      // ========== FLUXO SENHA (aguardando digitação) ==========
      if (!ehGrupo && aguardandoSenha.has(sender)) {
        aguardandoSenha.delete(sender);
        const novaSenha = conteudo.trim();
        if (novaSenha.length < 4) {
          return enviar("❌ Senha muito curta! Use no mínimo 4 caracteres. Tente novamente com *.senha*");
        }
        if (novaSenha.length > 20) {
          return enviar("❌ Senha muito longa! Use no máximo 20 caracteres.");
        }
        setSenha(sender, novaSenha);
        return enviar(
          `✅ *Senha ${getUser(sender)?.senha ? 'atualizada' : 'criada'} com sucesso!*\n\n🔐 Use essa senha para entrar no painel web junto com seu número.\n\n🌐 Acesse o site e faça login com:\n• Número: ${sender.split('@')[0]}\n• Senha: a que você acabou de definir`
        );
      }

      // ========== FLUXO AGUARDANDO LINK DO GRUPO ==========
      if (!ehGrupo && aguardandoLink.has(sender)) {
        aguardandoLink.delete(sender);
        const link = conteudo.trim();
        if (!link.includes('chat.whatsapp.com/')) {
          return enviar("❌ Link inválido. Envie um link válido do grupo.\n\nTente novamente com *.link*");
        }
        const code = link.split('chat.whatsapp.com/')[1]?.split(/[?&\s]/)[0];
        if (!code) return enviar("❌ Não consegui extrair o código do link.");

        await enviar("⏳ Entrando no grupo...");
        try {
          const groupId = await sock.groupAcceptInvite(code);
          await sleep(2000);
          let nomeGrupo = groupId;
          try { const meta = await sock.groupMetadata(groupId); nomeGrupo = meta.subject || groupId; } catch {}
          addGrupo(groupId, sender, nomeGrupo);

          await enviar(`✅ *Entrei no grupo!*\n\n🏠 *${nomeGrupo}*\n\nAgora preciso ser *administrador* para funcionar.\n📌 Peça a um admin do grupo para me promover, depois clique na opção abaixo.`);
          await sleep(800);

          // Envia lista com 1 opção para confirmar admin manualmente
          await sendAdminConfirmList(sock, from, groupId, nomeGrupo);

          // Avisa no grupo
          await sleep(3000);
          await sock.sendMessage(groupId, {
            text: `👋 *BotAluguel aqui!*\n\n🤖 Fui adicionado por *${nome}*.\n\n⚠️ Para ativar, preciso ser *administrador* deste grupo. Por favor, me promova! 🙏`
          });
        } catch (err) {
          await enviar(`❌ Erro ao entrar no grupo: ${err.message}`);
        }
        return;
      }

      createUser(sender, nome);

      // ========== VERIFICAR PREFIXO ==========
      let prefixoUsado = null;
      for (const p of prefixos) { if (conteudo.startsWith(p)) { prefixoUsado = p; break; } }
      if (!prefixoUsado) return;

      const args = conteudo.trim().slice(prefixoUsado.length).split(/\s+/);
      const cmd  = args[0]?.toLowerCase() || '';
      const q    = args.slice(1).join(' ');
      const ehDono = sender === dono;

      if (!botAtivo && !ehDono) return;

      console.log(chalk.gray(`[CMD] ${nome} > ${prefixoUsado}${cmd}${q ? ' ' + q : ''}`));

      // ========== COMANDOS DE GRUPO (após ativação) =====
      if (ehGrupo) {
        const grupo = getGrupo(from);
        if (!grupo || grupo.status !== 'ativo') return;

        if (cmd === 'menu' || cmd === 'start') {
          await reagir('🤖'); await digitar();
          const plano = getPlanoAtivo(grupo.dono);
          await sendList(sock, from, {
            title: '🤖 BotAluguel',
            text:  `📦 Plano: *${grupo.nomePlano || '?'}* | ⏳ ${plano ? formatarTempo(plano.expiraEm) : '?'}`,
            footer: 'Selecione uma opção',
            buttonText: 'ABRIR MENU',
            sections: [{
              title: 'Opções do grupo',
              rows: [
                { id: '.status', title: '📊 Status do Plano', description: 'Ver tempo restante e detalhes' },
                { id: '.info',   title: 'ℹ️ Informações',     description: 'Detalhes sobre o grupo' }
              ]
            }]
          }, info);
        } else if (cmd === 'status') {
          await reagir('📊');
          const plano = getPlanoAtivo(grupo.dono);
          if (!plano) return enviar("⚠️ Plano expirado! O responsável deve renovar com *.planos*");
          await enviar(`📊 *STATUS*\n\n🏠 ${grupo.nomeGrupo || 'Este grupo'}\n✅ Ativo\n📦 ${plano.nomePlano}\n⏳ ${formatarTempo(plano.expiraEm)}`);
        } else if (cmd === 'info') {
          await reagir('ℹ️');
          const meta = await sock.groupMetadata(from).catch(() => null);
          await enviar(`ℹ️ *INFORMAÇÕES*\n\n🏠 ${meta?.subject || from}\n👥 ${meta?.participants?.length || '?'} membros\n🤖 BotAluguel`);
        }
        return;
      }

      // ========== COMANDOS PRIVADOS ==========
      switch (cmd) {

        // ── MENU PRINCIPAL (1 botão → lista de opções) ──────────────────
        case 'menu': case 'start': case 'inicio': {
          await reagir('🤖'); await digitar();
          const moedas = getMoedas(sender);
          const plano  = getPlanoAtivo(sender);
          const grupos = getGruposDoUsuario(sender);

          await sendList(sock, from, {
            title: '🤖 BotAluguel',
            text:
              `👤 *${nome}*\n` +
              `🪙 Moedas: *${moedas}*\n` +
              `📦 Plano: *${plano ? plano.nomePlano : 'Nenhum'}*\n` +
              `🏠 Grupos: *${grupos.length}*`,
            footer: 'Selecione uma opção abaixo',
            buttonText: '📋 ABRIR MENU',
            sections: [{
              title: '👤 Minha Conta',
              rows: [
                { id: '.painel',     title: '📊 Meu Painel',         description: 'Saldo, plano e grupos'       },
                { id: '.recarregar', title: '💳 Recarregar Moedas',  description: 'Comprar moedas via PIX'      },
                { id: '.planos',     title: '📦 Ver Planos',         description: 'Básico, Pro, Premium'        }
              ]
            }, {
              title: '🏠 Grupos',
              rows: [
                { id: '.link',       title: '🔗 Adicionar ao Grupo',  description: 'Adicionar bot em um grupo' },
                { id: '.grupos',     title: '🏠 Meus Grupos',         description: 'Listar grupos vinculados'  }
              ]
            }, {
              title: '⚙️ Outros',
              rows: [
                { id: '.senha',      title: '🔐 Definir Senha',       description: 'Senha para o painel web'   },
                { id: '.ajuda',      title: '❓ Ajuda',               description: 'Como usar o bot'           }
              ]
            }]
          }, info);
          break;
        }

        // ── PAINEL ──────────────────────────────────────────────────────
        case 'painel': case 'perfil': case 'eu': {
          await reagir('📊'); await digitar();
          const moedas = getMoedas(sender);
          const plano  = getPlanoAtivo(sender);
          const grupos = getGruposDoUsuario(sender);
          const user   = getUser(sender);

          let msg =
            `📊 *MEU PAINEL*\n${'═'.repeat(26)}\n\n` +
            `👤 *${nome}*\n` +
            `📱 ${sender.split('@')[0]}\n` +
            `🔐 Senha: ${user?.senha ? '✅ Definida' : '❌ Não definida'}\n` +
            `🪙 Moedas: *${moedas}*\n\n`;

          if (plano) {
            msg += `📦 *PLANO ATIVO*\n• ${plano.nomePlano}\n• ${plano.maxGrupos === -1 ? '∞ grupos' : `${plano.maxGrupos} grupo(s)`}\n• Expira: ${formatarTempo(plano.expiraEm)}\n\n`;
          } else {
            msg += `📦 *Sem plano ativo.*\n\n`;
          }

          if (grupos.length > 0) {
            msg += `🏠 *GRUPOS (${grupos.length})*\n`;
            for (const g of grupos) {
              const ico = g.status === 'ativo' ? '✅' : g.adminRecebido ? '🟡' : '⏳';
              msg += `${ico} ${g.nomeGrupo || g.id}\n`;
            }
          } else {
            msg += `🏠 *Nenhum grupo vinculado.*`;
          }

          await enviar(msg);
          await sleep(400);

          await sendList(sock, from, {
            title: '⚡ Ações rápidas',
            text:  `Saldo: *${moedas} moedas* | Plano: *${plano ? plano.nomePlano : 'Nenhum'}*`,
            footer: 'O que deseja fazer?',
            buttonText: 'ESCOLHER AÇÃO',
            sections: [{
              title: 'Ações',
              rows: [
                { id: '.recarregar', title: '💳 Recarregar Moedas',   description: 'Comprar moedas via PIX'    },
                { id: '.planos',     title: '📦 Ver Planos',          description: 'Comprar um plano'          },
                { id: '.link',       title: '🔗 Adicionar Grupo',     description: 'Vincular um novo grupo'    },
                { id: '.grupos',     title: '🏠 Meus Grupos',         description: 'Gerenciar grupos'          },
                { id: '.senha',      title: '🔐 Definir/Trocar Senha', description: 'Senha para o painel web' }
              ]
            }]
          });
          break;
        }

        // ── SENHA DO PAINEL ──────────────────────────────────────────────
        case 'senha': {
          await reagir('🔐'); await digitar();
          const user = getUser(sender);

          if (q) {
            // Senha fornecida diretamente: .senha minhasenha
            const novaSenha = q.trim();
            if (novaSenha.length < 4) return enviar("❌ Senha muito curta. Mínimo 4 caracteres.");
            if (novaSenha.length > 20) return enviar("❌ Senha muito longa. Máximo 20 caracteres.");
            setSenha(sender, novaSenha);
            await enviar(
              `✅ *Senha ${user?.senha ? 'atualizada' : 'criada'}!*\n\n` +
              `🔐 Sua senha foi salva com segurança.\n\n` +
              `🌐 *Acesso ao painel web:*\n` +
              `• Número: \`${sender.split('@')[0]}\`\n` +
              `• Senha: a que você definiu\n\n` +
              `_Nunca compartilhe sua senha!_`
            );
          } else {
            if (user?.senha) {
              // Já tem senha → oferecer trocar
              aguardandoSenha.set(sender, true);
              await enviar(
                `🔐 *Você já tem uma senha definida.*\n\n` +
                `Para *trocar*, envie sua nova senha agora:\n_(mínimo 4, máximo 20 caracteres)_`
              );
            } else {
              // Não tem senha → criar
              aguardandoSenha.set(sender, true);
              await enviar(
                `🔐 *Criar senha do painel web*\n\n` +
                `Envie sua senha agora:\n_(mínimo 4, máximo 20 caracteres)_\n\n` +
                `Ou use: *.senha minhasenha*`
              );
            }
          }
          break;
        }

        // ── RECARREGAR ───────────────────────────────────────────────────
        case 'recarregar': case 'recarga': {
          await reagir('💳'); await digitar();

          if (q && !isNaN(parseFloat(q))) {
            const valor = parseFloat(parseFloat(q).toFixed(2));
            if (valor < 0.01) return enviar("❌ Valor mínimo: R$ 0,01");

            await enviar('⏳ Gerando PIX...');
            const pag = await gerarRecargaPix(sender, valor);
            if (pag.error) return enviar(`❌ Erro: ${pag.error}`);

            const moedas = Math.floor(valor / BRL_POR_MOEDA);
            if (pag.qrCodeBase64) {
              try {
                const buf = Buffer.from(pag.qrCodeBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                await sock.sendMessage(from, {
                  image: buf,
                  caption: `💳 *PIX — R$ ${valor.toFixed(2)}*\n🪙 +${moedas} moedas após pagamento!\n⏳ Válido por 1 hora.`
                }, { quoted: info });
              } catch {
                await enviar(`💳 *PIX — R$ ${valor.toFixed(2)}*\n🪙 +${moedas} moedas!`);
              }
            }
            await sleep(1500);
            await sock.sendMessage(from, { text: '```' + pag.copiaCola + '```' }, { quoted: info });
            monitorarPix(pag.txid, from, sock);
          } else {
            // Mostra lista com valores pré-definidos (1 botão → caixa)
            await sendList(sock, from, {
              title: '💳 Recarregar Moedas',
              text:
                `🪙 Saldo atual: *${getMoedas(sender)} moedas*\n\n` +
                `*1 BRL = 100 moedas*\nMínimo: R$ 0,01\n\nEscolha um valor ou use:\n*.recarregar 5* (ex: R$ 5,00)`,
              footer: 'Pagamento via PIX — confirmação automática',
              buttonText: 'ESCOLHER VALOR',
              sections: [{
                title: 'Valores disponíveis',
                rows: [
                  { id: '.recarregar 0.01',  title: 'R$ 0,01 — 1 moeda',      description: '🧪 Teste rápido'        },
                  { id: '.recarregar 0.10',  title: 'R$ 0,10 — 10 moedas',    description: '📦 Pacote mínimo'       },
                  { id: '.recarregar 1',     title: 'R$ 1,00 — 100 moedas',   description: '💼 Pacote básico'       },
                  { id: '.recarregar 5',     title: 'R$ 5,00 — 500 moedas',   description: '🚀 Pacote intermediário' },
                  { id: '.recarregar 10',    title: 'R$ 10,00 — 1000 moedas', description: '⭐ Pacote avançado'      },
                  { id: '.recarregar 25',    title: 'R$ 25,00 — 2500 moedas', description: '👑 Pacote premium'      }
                ]
              }]
            }, info);
          }
          break;
        }

        // ── PLANOS ───────────────────────────────────────────────────────
        case 'planos': {
          await reagir('📦'); await digitar();
          const moedas    = getMoedas(sender);
          const planoAtivo = getPlanoAtivo(sender);

          await sendList(sock, from, {
            title: '📦 Planos Disponíveis',
            text:
              `🪙 Seu saldo: *${moedas} moedas*\n\n` +
              (planoAtivo
                ? `📌 Plano atual: *${planoAtivo.nomePlano}* — expira em ${formatarTempo(planoAtivo.expiraEm)}\n`
                : `📌 Sem plano ativo.\n`) +
              `\nSelecione um plano para comprar:`,
            footer: 'BotAluguel — Aluguel de bot WhatsApp',
            buttonText: 'ESCOLHER PLANO',
            sections: [{
              title: 'Planos disponíveis',
              rows: [
                {
                  id: `.comprar basico`,
                  title: `⭐ Básico — ${PLANOS.basico.moedas}🪙`,
                  description: `${PLANOS.basico.dias} dias • 1 grupo • ${moedas >= PLANOS.basico.moedas ? '✅ Disponível' : '❌ Saldo insuficiente'}`
                },
                {
                  id: `.comprar pro`,
                  title: `💎 Pro — ${PLANOS.pro.moedas}🪙`,
                  description: `${PLANOS.pro.dias} dias • 5 grupos • ${moedas >= PLANOS.pro.moedas ? '✅ Disponível' : '❌ Saldo insuficiente'}`
                },
                {
                  id: `.comprar premium`,
                  title: `👑 Premium — ${PLANOS.premium.moedas}🪙`,
                  description: `${PLANOS.premium.dias} dias • Ilimitado • ${moedas >= PLANOS.premium.moedas ? '✅ Disponível' : '❌ Saldo insuficiente'}`
                }
              ]
            }]
          }, info);
          break;
        }

        // ── COMPRAR PLANO ────────────────────────────────────────────────
        case 'comprar': {
          await reagir('🛒');
          const planKey = q.toLowerCase().trim();
          const plano   = PLANOS[planKey];

          if (!plano) {
            return sendList(sock, from, {
              title: '❌ Plano inválido',
              text:  'Escolha um plano válido:',
              footer: '',
              buttonText: 'ESCOLHER PLANO',
              sections: [{
                title: 'Planos',
                rows: [
                  { id: '.comprar basico',  title: '⭐ Básico',  description: `${PLANOS.basico.moedas}🪙 • 1 grupo`     },
                  { id: '.comprar pro',     title: '💎 Pro',     description: `${PLANOS.pro.moedas}🪙 • 5 grupos`       },
                  { id: '.comprar premium', title: '👑 Premium', description: `${PLANOS.premium.moedas}🪙 • ilimitado` }
                ]
              }]
            }, info);
          }

          const moedas = getMoedas(sender);
          if (moedas < plano.moedas) {
            return enviar(
              `❌ *Saldo insuficiente!*\n\nVocê tem: *${moedas}*\nNecessário: *${plano.moedas}*\n\nRecarregue com *.recarregar*`
            );
          }

          await digitar();

          // Confirmação: 1 botão → lista com confirmar/cancelar
          await sendList(sock, from, {
            title: '🛒 Confirmar compra',
            text:
              `${plano.nome}\n` +
              `🪙 Custo: *${plano.moedas} moeda(s)*\n` +
              `⏳ Duração: *${plano.dias} dias*\n` +
              `🏠 Grupos: *${plano.maxGrupos === -1 ? 'Ilimitados' : plano.maxGrupos}*\n\n` +
              `Saldo após compra: *${moedas - plano.moedas} moedas*`,
            footer: 'Escolha uma opção',
            buttonText: 'RESPONDER',
            sections: [{
              title: 'Confirmação',
              rows: [
                { id: `.confirmar_compra ${planKey}`, title: `✅ Confirmar — ${plano.nome}`, description: 'Ativar plano agora'  },
                { id: '.planos',                      title: '❌ Cancelar',                 description: 'Voltar aos planos' }
              ]
            }]
          }, info);
          break;
        }

        // ── CONFIRMAR COMPRA ─────────────────────────────────────────────
        case 'confirmar_compra': {
          const planKey = q.toLowerCase().trim();
          const plano   = PLANOS[planKey];
          if (!plano) return;
          await digitar();
          const ok = ativarPlano(sender, planKey);
          if (ok) {
            await reagir('🎉');
            await enviar(
              `✅ *${plano.nome} ativado!*\n${'═'.repeat(26)}\n\n` +
              `🪙 Gasto: *${plano.moedas}*\n💰 Saldo: *${getMoedas(sender)} moedas*\n` +
              `⏳ Duração: *${plano.dias} dias*\n🏠 Grupos: *${plano.maxGrupos === -1 ? 'Ilimitados' : plano.maxGrupos}*`
            );
            await sleep(500);
            await sendList(sock, from, {
              title: '🔗 Próximo passo',
              text:  'Adicione o bot ao seu grupo para começar!',
              footer: '',
              buttonText: 'O QUE FAZER AGORA',
              sections: [{
                title: 'Próximos passos',
                rows: [
                  { id: '.link',   title: '🔗 Adicionar ao Grupo', description: 'Vincular o bot a um grupo' },
                  { id: '.grupos', title: '🏠 Meus Grupos',        description: 'Ver grupos vinculados'     }
                ]
              }]
            });
          } else {
            await enviar("❌ Erro ao ativar. Verifique seu saldo com *.painel*");
          }
          break;
        }

        // ── LINK DO GRUPO ────────────────────────────────────────────────
        case 'link': case 'adicionar': {
          await reagir('🔗');
          const plano = getPlanoAtivo(sender);
          if (!plano) {
            return sendList(sock, from, {
              title: '❌ Sem plano ativo',
              text:  'Você precisa de um plano para adicionar grupos.',
              footer: '',
              buttonText: 'O QUE FAZER',
              sections: [{
                title: 'Opções',
                rows: [
                  { id: '.planos',     title: '📦 Ver Planos',     description: 'Comprar um plano' },
                  { id: '.recarregar', title: '💳 Recarregar',     description: 'Comprar moedas'   }
                ]
              }]
            }, info);
          }

          const gruposAtivos = countGruposAtivos(sender);
          if (plano.maxGrupos !== -1 && gruposAtivos >= plano.maxGrupos) {
            return enviar(
              `❌ *Limite atingido!*\n\nSeu plano permite *${plano.maxGrupos}* grupo(s).\nVocê já tem *${gruposAtivos}* ativo(s).\n\nFaça upgrade: *.comprar pro* ou *.comprar premium*`
            );
          }

          aguardandoLink.set(sender, true);
          await digitar();
          await enviar(
            `🔗 *ADICIONAR BOT AO GRUPO*\n${'─'.repeat(26)}\n\n` +
            `📋 Plano: *${plano.nomePlano}*\n🏠 Grupos: *${gruposAtivos}/${plano.maxGrupos === -1 ? '∞' : plano.maxGrupos}*\n\n` +
            `📎 *Envie o link de convite do grupo:*\n\n` +
            `_Ex: https://chat.whatsapp.com/XXXXXXX_\n\n` +
            `_(Grupo → ⋮ → Convidar pelo link → Copiar)_`
          );
          break;
        }

        // ── ATIVAR BOT NO GRUPO ──────────────────────────────────────────
        case 'ativar': {
          await reagir('✅');
          const groupId = q.trim();

          if (!groupId) {
            const grupos = getGruposDoUsuario(sender).filter(g => g.adminRecebido && g.status !== 'ativo');
            if (grupos.length === 0) {
              return sendList(sock, from, {
                title: '⚠️ Nenhum grupo pronto',
                text:  'Use .link para adicionar o bot a um grupo primeiro.',
                footer: '',
                buttonText: 'O QUE FAZER',
                sections: [{
                  title: 'Opções',
                  rows: [{ id: '.link', title: '🔗 Adicionar ao Grupo', description: 'Vincular um grupo' }]
                }]
              }, info);
            }

            const rows = grupos.map(g => ({
              id: `.ativar ${g.id}`,
              title: `🟡 ${g.nomeGrupo || 'Grupo'}`,
              description: 'Clique para ativar o bot aqui'
            }));

            return sendList(sock, from, {
              title: '✅ Ativar Bot',
              text:  'Grupos prontos para ativar (já tenho admin):',
              footer: '',
              buttonText: 'SELECIONAR GRUPO',
              sections: [{ title: 'Grupos disponíveis', rows }]
            }, info);
          }

          const grupo = getGrupo(groupId);
          if (!grupo)                              return enviar("❌ Grupo não encontrado.");
          if (grupo.dono !== sender && !ehDono)    return enviar("❌ Este grupo não pertence a você.");
          if (!grupo.adminRecebido && !ehDono)     return enviar("⚠️ Ainda não sou admin neste grupo.");
          if (grupo.status === 'ativo')            return enviar("✅ O bot já está ativo neste grupo!");

          const plano = getPlanoAtivo(sender);
          if (!plano)                              return enviar("❌ Sem plano ativo! Use *.planos*");

          const gruposAtivos = countGruposAtivos(sender);
          if (plano.maxGrupos !== -1 && gruposAtivos >= plano.maxGrupos) {
            return enviar(`❌ Limite atingido (${plano.maxGrupos}). Faça upgrade.`);
          }

          updateGrupo(groupId, { status: 'ativo', ativadoEm: new Date().toISOString(), nomePlano: plano.nomePlano });
          await digitar();
          await enviar(`✅ *Bot ativado!*\n\n🏠 ${grupo.nomeGrupo || groupId}\n📦 ${plano.nomePlano}\n⏳ ${formatarTempo(plano.expiraEm)}`);
          await sock.sendMessage(groupId, { text: `🎉 *BotAluguel — Ativado!*\n\nUse *.menu* para ver as opções. 🤖` });
          break;
        }

        // ── GRUPOS ───────────────────────────────────────────────────────
        case 'grupos': case 'meusgrupos': {
          await reagir('🏠'); await digitar();
          const grupos = getGruposDoUsuario(sender);
          const plano  = getPlanoAtivo(sender);

          if (grupos.length === 0) {
            return sendList(sock, from, {
              title: '🏠 Nenhum grupo',
              text:  'Você ainda não tem grupos vinculados.',
              footer: '',
              buttonText: 'O QUE FAZER',
              sections: [{ title: 'Opções', rows: [{ id: '.link', title: '🔗 Adicionar ao Grupo', description: 'Vincular um grupo' }] }]
            }, info);
          }

          let msg = `🏠 *MEUS GRUPOS (${grupos.length})*\n${'═'.repeat(26)}\n\n`;
          for (const [i, g] of grupos.entries()) {
            const ico = g.status === 'ativo' ? '✅' : g.adminRecebido ? '🟡' : '⏳';
            msg += `${i+1}. ${ico} *${g.nomeGrupo || 'Grupo'}*\n`;
            if (g.status === 'ativo' && plano) msg += `   ⏳ ${formatarTempo(plano.expiraEm)}\n`;
            if (g.adminRecebido && g.status !== 'ativo') msg += `   ➜ \`.ativar ${g.id}\`\n`;
            if (!g.adminRecebido) msg += `   ➜ Aguardando admin\n`;
            msg += '\n';
          }
          await enviar(msg);
          break;
        }

        // ── AJUDA ────────────────────────────────────────────────────────
        case 'ajuda': case 'help': {
          await reagir('❓'); await digitar();
          await sendList(sock, from, {
            title: '❓ Ajuda — BotAluguel',
            text:
              '*Como usar:*\n\n' +
              '1️⃣ Recarregue moedas via PIX\n' +
              '2️⃣ Compre um plano\n' +
              '3️⃣ Adicione o bot ao grupo (.link)\n' +
              '4️⃣ Ative após receber admin (.ativar)\n\n' +
              'Dúvidas? Selecione abaixo:',
            footer: 'BotAluguel — Suporte',
            buttonText: 'VER OPÇÕES',
            sections: [{
              title: 'Guia rápido',
              rows: [
                { id: '.recarregar', title: '💳 Recarregar Moedas',   description: 'Comprar moedas via PIX'   },
                { id: '.planos',     title: '📦 Ver Planos',          description: 'Básico, Pro, Premium'     },
                { id: '.link',       title: '🔗 Adicionar ao Grupo',  description: 'Vincular grupo ao bot'    },
                { id: '.grupos',     title: '🏠 Meus Grupos',         description: 'Status dos seus grupos'  },
                { id: '.senha',      title: '🔐 Senha do Painel Web', description: 'Acesso ao painel online' }
              ]
            }]
          }, info);
          break;
        }

        // ── COMANDOS DO DONO ─────────────────────────────────────────────
        case 'ligar':    { if (!ehDono) return; botAtivo = true;  return enviar("✅ Bot ligado!"); }
        case 'desligar': { if (!ehDono) return; botAtivo = false; return enviar("🔴 Bot desligado!"); }
        case 'darmoedas': {
          if (!ehDono) return;
          const [num, qtd] = q.split(' ');
          if (!num || !qtd) return enviar("❌ Use: .darmoedas [número] [qtd]");
          const targetId = num.replace(/\D/g, '') + '@s.whatsapp.net';
          createUser(targetId, 'Usuário');
          addMoedas(targetId, parseInt(qtd));
          return enviar(`✅ ${qtd} moedas → ${num}`);
        }
        case 'usuarios': { if (!ehDono) return; return enviar(`👥 Usuários: *${lerDB(PATHS.usuarios).length}*`); }
      }

    } catch (err) {
      console.error(chalk.red("[ERRO]"), err.message, err.stack?.split('\n')[1]);
    }
  });
}

iniciarBot();
