"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  phone: string | null;
  messages: Message[];
  updatedAt: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected]);

  async function loadConversations(phone?: string) {
    const url = phone ? `/api/conversations?phone=${encodeURIComponent(phone)}` : "/api/conversations";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setConversations(data);
    }
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearch(val);
    loadConversations(val || undefined);
  }

  function formatDate(iso: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  }

  function getInitials(phone: string | null) {
    if (!phone) return "?";
    return phone.slice(-2);
  }

  const lastMessage = (conv: Conversation) =>
    conv.messages[conv.messages.length - 1]?.content ?? "";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Lista */}
      <div
        style={{
          width: "300px",
          minWidth: "300px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
          <h1
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              margin: "0 0 12px",
              color: "var(--text-primary)",
            }}
          >
            Conversas WhatsApp
          </h1>
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por número..."
            style={{
              width: "100%",
              padding: "8px 12px",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          {conversations.length === 0 && (
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Nenhuma conversa ainda
            </div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelected(conv)}
              style={{
                padding: "14px 16px",
                cursor: "pointer",
                borderLeft: selected?.id === conv.id ? "3px solid var(--accent-amber)" : "3px solid transparent",
                backgroundColor: selected?.id === conv.id ? "var(--bg-tertiary)" : "transparent",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono), monospace",
                  color: "var(--accent-cyan)",
                  flexShrink: 0,
                }}
              >
                {getInitials(conv.phone)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {conv.phone ?? "Desconhecido"}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono), monospace" }}>
                    {formatDate(conv.updatedAt)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lastMessage(conv)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalhes */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!selected ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              fontSize: "14px",
            }}
          >
            Selecione uma conversa
          </div>
        ) : (
          <>
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono), monospace",
                  color: "var(--accent-cyan)",
                }}
              >
                {getInitials(selected.phone)}
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {selected.phone ?? "Desconhecido"}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {selected.messages.length} mensagens
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
              {selected.messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ maxWidth: "70%" }}>
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                        backgroundColor: msg.role === "user" ? "var(--bg-tertiary)" : "var(--bg-secondary)",
                        border: msg.role === "assistant" ? "1px solid var(--accent-cyan)" : "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.content}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        marginTop: "4px",
                        textAlign: msg.role === "user" ? "right" : "left",
                        fontFamily: "var(--font-mono), monospace",
                      }}
                    >
                      {formatDate(msg.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
