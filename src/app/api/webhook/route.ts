import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResponse, type ChatMessage } from "@/lib/openai";
import { sendWhatsAppMessage } from "@/lib/evolution";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (body.event !== "messages.upsert") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const data = body.data;
  if (!data) return NextResponse.json({ ok: true, ignored: true });

  if (data.key?.fromMe === true) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const remoteJid: string = data.key?.remoteJid ?? "";
  if (remoteJid.includes("@g.us")) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const phone = remoteJid.replace("@s.whatsapp.net", "");
  const text: string =
    data.message?.conversation ?? data.message?.extendedTextMessage?.text ?? "";

  if (!text || !phone) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  let config = await prisma.agentConfig.findFirst();
  if (!config) {
    config = await prisma.agentConfig.create({ data: {} });
  }

  if (!config.enabled) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (config.allowedPhones) {
    const allowed = config.allowedPhones.split(",").map((p) => p.trim());
    if (!allowed.includes(phone)) {
      return NextResponse.json({ ok: true, ignored: true });
    }
  }

  let conversation = await prisma.conversation.findFirst({
    where: { source: "whatsapp", phone },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { source: "whatsapp", phone },
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: "user", content: text },
  });

  const history = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: config.historyLimit,
  });

  const messages: ChatMessage[] = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const { content: reply, tokens } = await generateResponse(
    messages,
    config.systemPrompt,
    config.temperature,
    config.maxTokens,
    {
      aiProvider: config.aiProvider,
      openaiApiKey: config.openaiApiKey,
      openaiModel: config.openaiModel,
      groqApiKey: config.groqApiKey,
      groqModel: config.groqModel,
    }
  );

  await prisma.message.create({
    data: { conversationId: conversation.id, role: "assistant", content: reply, tokens },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  await sendWhatsAppMessage(
    config.evolutionUrl,
    config.evolutionApiKey,
    config.instanceId,
    phone,
    reply
  );

  return NextResponse.json({ ok: true });
}
