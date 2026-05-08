import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phone = request.nextUrl.searchParams.get("phone");

  const conversations = await prisma.conversation.findMany({
    where: {
      source: "whatsapp",
      ...(phone ? { phone: { contains: phone } } : {}),
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(conversations);
}
