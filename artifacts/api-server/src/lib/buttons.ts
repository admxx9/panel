import {
  generateWAMessageFromContent,
  normalizeMessageContent,
  isJidGroup,
  generateMessageIDV2,
  type WASocket,
} from "baileys";

function buildInteractiveButtons(buttons: any[] = []) {
  return buttons.map((b, i) => {
    if (b && b.name && b.buttonParamsJson) return b;
    if (b && (b.id || b.text)) {
      return {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: b.text || b.displayText || "Button " + (i + 1),
          id: b.id || "quick_" + (i + 1),
        }),
      };
    }
    if (b && b.buttonId && b.buttonText?.displayText) {
      return {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: b.buttonText.displayText,
          id: b.buttonId,
        }),
      };
    }
    return b;
  });
}

function getButtonType(message: any): "list" | "buttons" | "native_flow" | null {
  if (message.listMessage) return "list";
  if (message.buttonsMessage) return "buttons";
  if (message.interactiveMessage?.nativeFlowMessage) return "native_flow";
  return null;
}

function getButtonArgs(message: any) {
  const nativeFlow = message.interactiveMessage?.nativeFlowMessage;
  const firstButtonName = nativeFlow?.buttons?.[0]?.name;
  const nativeFlowSpecials = [
    "mpm", "cta_catalog", "send_location",
    "call_permission_request", "wa_payment_transaction_details",
    "automated_greeting_message_view_catalog",
  ];

  if (nativeFlow && (firstButtonName === "review_and_pay" || firstButtonName === "payment_info")) {
    return {
      tag: "biz",
      attrs: { native_flow_name: firstButtonName === "review_and_pay" ? "order_details" : firstButtonName },
    };
  } else if (nativeFlow && nativeFlowSpecials.includes(firstButtonName)) {
    return {
      tag: "biz",
      attrs: {},
      content: [{
        tag: "interactive",
        attrs: { type: "native_flow", v: "1" },
        content: [{ tag: "native_flow", attrs: { v: "2", name: firstButtonName } }],
      }],
    };
  } else if (nativeFlow || message.buttonsMessage) {
    return {
      tag: "biz",
      attrs: {},
      content: [{
        tag: "interactive",
        attrs: { type: "native_flow", v: "1" },
        content: [{ tag: "native_flow", attrs: { v: "9", name: "mixed" } }],
      }],
    };
  } else if (message.listMessage) {
    return {
      tag: "biz",
      attrs: {},
      content: [{ tag: "list", attrs: { v: "2", type: "product_list" } }],
    };
  }
  return { tag: "biz", attrs: {} };
}

function convertToInteractiveMessage(content: any) {
  if (content.interactiveButtons && content.interactiveButtons.length > 0) {
    const interactiveMessage: any = {
      nativeFlowMessage: {
        buttons: content.interactiveButtons.map((btn: any) => ({
          name: btn.name || "quick_reply",
          buttonParamsJson: btn.buttonParamsJson,
        })),
      },
    };
    if (content.title || content.subtitle) {
      interactiveMessage.header = { title: content.title || content.subtitle || "" };
    }
    if (content.text) interactiveMessage.body = { text: content.text };
    if (content.footer) interactiveMessage.footer = { text: content.footer };

    const newContent = { ...content };
    delete newContent.interactiveButtons;
    delete newContent.title;
    delete newContent.subtitle;
    delete newContent.text;
    delete newContent.footer;
    return { ...newContent, interactiveMessage };
  }
  return content;
}

export async function sendInteractiveButtons(
  sock: WASocket,
  jid: string,
  data: {
    text: string;
    footer?: string;
    title?: string;
    buttons: { id: string; text: string }[];
  },
  options: any = {},
) {
  const { text = "", footer = "", title, buttons = [] } = data;
  const interactiveButtons = buildInteractiveButtons(buttons);
  const payload: any = { text, footer, interactiveButtons };
  if (title) payload.title = title;

  const convertedContent = convertToInteractiveMessage(payload);

  const userJid = (sock as any).authState?.creds?.me?.id || sock.user?.id;
  const fullMsg = generateWAMessageFromContent(jid, convertedContent, {
    userJid,
    messageId: generateMessageIDV2(userJid),
    timestamp: new Date(),
    ...options,
  });

  const normalizedContent = normalizeMessageContent(fullMsg.message);
  const buttonType = getButtonType(normalizedContent || {});
  const additionalNodes: any[] = [...(options.additionalNodes || [])];
  if (buttonType) {
    const buttonsNode = getButtonArgs(normalizedContent || {});
    additionalNodes.push(buttonsNode);
    if (!isJidGroup(jid)) {
      additionalNodes.push({ tag: "bot", attrs: { biz_bot: "1" } });
    }
  }

  await sock.relayMessage(jid, fullMsg.message!, {
    messageId: fullMsg.key.id!,
    additionalNodes,
  });

  return fullMsg;
}

export async function sendInteractiveList(
  sock: WASocket,
  jid: string,
  data: {
    text: string;
    footer?: string;
    title?: string;
    buttonText: string;
    sections: { title: string; rows: { id: string; title: string; description?: string }[] }[];
  },
  options: any = {},
) {
  const { text, footer = "", title = "", buttonText, sections } = data;

  const interactiveButtons = [{
    name: "single_select",
    buttonParamsJson: JSON.stringify({
      title: buttonText || "VER OPCOES",
      sections: sections.map(s => ({
        title: s.title,
        rows: s.rows.map(r => ({
          header: r.title,
          title: r.title,
          description: r.description || "",
          id: r.id,
        })),
      })),
    }),
  }];

  const payload: any = { text, footer, interactiveButtons };
  if (title) payload.title = title;

  const convertedContent = convertToInteractiveMessage(payload);

  const userJid = (sock as any).authState?.creds?.me?.id || sock.user?.id;
  const fullMsg = generateWAMessageFromContent(jid, convertedContent, {
    userJid,
    messageId: generateMessageIDV2(userJid),
    timestamp: new Date(),
    ...options,
  });

  const normalizedContent = normalizeMessageContent(fullMsg.message);
  const buttonType = getButtonType(normalizedContent || {});
  const additionalNodes: any[] = [...(options.additionalNodes || [])];
  if (buttonType) {
    const buttonsNode = getButtonArgs(normalizedContent || {});
    additionalNodes.push(buttonsNode);
    if (!isJidGroup(jid)) {
      additionalNodes.push({ tag: "bot", attrs: { biz_bot: "1" } });
    }
  }

  await sock.relayMessage(jid, fullMsg.message!, {
    messageId: fullMsg.key.id!,
    additionalNodes,
  });

  return fullMsg;
}
