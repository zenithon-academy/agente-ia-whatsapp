import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let config = await prisma.agentConfig.findFirst();
  if (!config) {
    config = await prisma.agentConfig.create({ data: {} });
  }
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, createdAt, updatedAt, ...data } = body;

  const config = await prisma.agentConfig.upsert({
    where: { id: id ?? "not-found" },
    update: data,
    create: data,
  });
  return NextResponse.json(config);
}
