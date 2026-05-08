"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  tokens?: number | null;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("conversationId");
    if (savedId) {
      setConversationId(savedId);
      loadHistory(savedId);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function loadHistory(id: string) {
    const res = await fetch("/api/chat");
    if (!res.ok) return;
    const conversations = await res.json();
    const conv = conversations.find((c: { id: string; messages: Message[] }) => c.id === id);
    if (conv) {
      setMessages(conv.messages);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, conversationId }),
      });

      const data = await res.json();
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem("conversationId", data.conversationId);
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, tokens: data.tokens },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao processar mensagem.", tokens: null },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleNewConversation() {
    localStorage.removeItem("conversationId");
    setConversationId(null);
    setMessages([]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: "18px",
            fontWeight: 700,
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          Chat de Teste
        </h1>
        <button
          onClick={handleNewConversation}
          style={{
            padding: "8px 16px",
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Nova conversa
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              marginTop: "60px",
              fontSize: "14px",
            }}
          >
            Envie uma mensagem para testar o agente
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "16px",
            }}
          >
            <div style={{ maxWidth: "70%" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                  backgroundColor:
                    msg.role === "user" ? "var(--bg-tertiary)" : "var(--bg-secondary)",
                  border:
                    msg.role === "assistant" ? "1px solid var(--accent-cyan)" : "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
              {msg.role === "assistant" && msg.tokens != null && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                    fontFamily: "var(--font-mono), monospace",
                  }}
                >
                  {msg.tokens} tokens
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px 12px 12px 4px",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--accent-cyan)",
                color: "var(--text-secondary)",
                fontSize: "14px",
              }}
            >
              digitando...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: "12px",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite uma mensagem..."
          style={{
            flex: 1,
            padding: "12px 16px",
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "12px 24px",
            backgroundColor: "var(--accent-amber)",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.6 : 1,
          }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
