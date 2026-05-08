"use client";

import { useState, useEffect } from "react";

interface Config {
  id: string;
  name: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  historyLimit: number;
  enabled: boolean;
  allowedPhones: string;
  evolutionUrl: string;
  evolutionApiKey: string;
  instanceId: string;
  aiProvider: string;
  openaiApiKey: string;
  openaiModel: string;
  groqApiKey: string;
  groqModel: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  backgroundColor: "var(--bg-tertiary)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--text-primary)",
  fontSize: "14px",
  outline: "none",
  marginTop: "6px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "var(--text-secondary)",
  marginBottom: "0",
};

const fieldStyle: React.CSSProperties = { marginBottom: "20px" };

const sectionStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "24px",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-syne), sans-serif",
  fontSize: "16px",
  fontWeight: 700,
  color: "var(--text-primary)",
  marginBottom: "20px",
  marginTop: 0,
};

export default function ConfigPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig);
    setWebhookUrl(window.location.origin + "/api/webhook");
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function update<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function copyWebhook() {
    await navigator.clipboard.writeText(webhookUrl);
  }

  if (!config) {
    return (
      <div style={{ padding: "40px", color: "var(--text-secondary)" }}>Carregando...</div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "760px" }}>
      <h1
        style={{
          fontFamily: "var(--font-syne), sans-serif",
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "24px",
          color: "var(--text-primary)",
        }}
      >
        Configurações
      </h1>

      <form onSubmit={handleSave}>
        {/* Geral */}
        <div style={sectionStyle}>
          <h2 style={sectionTitle}>Geral</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>Nome do agente</label>
            <input
              style={inputStyle}
              value={config.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Prompt do sistema</label>
            <textarea
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              value={config.systemPrompt}
              onChange={(e) => update("systemPrompt", e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Temperatura</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => update("temperature", parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label style={labelStyle}>Max tokens</label>
              <input
                style={inputStyle}
                type="number"
                min="1"
                value={config.maxTokens}
                onChange={(e) => update("maxTokens", parseInt(e.target.value))}
              />
            </div>
            <div>
              <label style={labelStyle}>Histórico (msgs)</label>
              <input
                style={inputStyle}
                type="number"
                min="1"
                value={config.historyLimit}
                onChange={(e) => update("historyLimit", parseInt(e.target.value))}
              />
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Agente ativo</label>
            <button
              type="button"
              onClick={() => update("enabled", !config.enabled)}
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: config.enabled ? "var(--accent-cyan)" : "var(--border)",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: config.enabled ? "22px" : "3px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  transition: "left 0.2s",
                }}
              />
            </button>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={labelStyle}>Telefones permitidos (CSV, vazio = todos)</label>
            <input
              style={inputStyle}
              value={config.allowedPhones}
              onChange={(e) => update("allowedPhones", e.target.value)}
              placeholder="5511999990000,5511888880000"
            />
          </div>
        </div>

        {/* Provedor de IA */}
        <div style={sectionStyle}>
          <h2 style={sectionTitle}>Provedor de IA</h2>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            {["openai", "groq"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => update("aiProvider", p)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: config.aiProvider === p ? "var(--accent-amber)" : "var(--border)",
                  backgroundColor:
                    config.aiProvider === p ? "rgba(240,160,32,0.1)" : "transparent",
                  color: config.aiProvider === p ? "var(--accent-amber)" : "var(--text-secondary)",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: config.aiProvider === p ? 600 : 400,
                }}
              >
                {p === "openai" ? "OpenAI" : "Groq (grátis)"}
              </button>
            ))}
          </div>

          {config.aiProvider === "openai" ? (
            <>
              <div style={fieldStyle}>
                <label style={labelStyle}>OpenAI API Key</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={config.openaiApiKey}
                  onChange={(e) => update("openaiApiKey", e.target.value)}
                  placeholder="sk-..."
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Modelo</label>
                <select
                  style={inputStyle}
                  value={config.openaiModel}
                  onChange={(e) => update("openaiModel", e.target.value)}
                >
                  <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                  <option value="gpt-4.1">gpt-4.1</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div style={fieldStyle}>
                <label style={labelStyle}>Groq API Key</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={config.groqApiKey}
                  onChange={(e) => update("groqApiKey", e.target.value)}
                  placeholder="gsk_..."
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Modelo</label>
                <select
                  style={inputStyle}
                  value={config.groqModel}
                  onChange={(e) => update("groqModel", e.target.value)}
                >
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                  <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
                  <option value="gemma2-9b-it">gemma2-9b-it</option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Evolution API */}
        <div style={sectionStyle}>
          <h2 style={sectionTitle}>Evolution API</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>URL da Evolution API</label>
            <input
              style={inputStyle}
              value={config.evolutionUrl}
              onChange={(e) => update("evolutionUrl", e.target.value)}
              placeholder="https://evolution.exemplo.com"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>API Key</label>
            <input
              style={inputStyle}
              type="password"
              value={config.evolutionApiKey}
              onChange={(e) => update("evolutionApiKey", e.target.value)}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Instance ID</label>
            <input
              style={inputStyle}
              value={config.instanceId}
              onChange={(e) => update("instanceId", e.target.value)}
            />
          </div>
        </div>

        {/* Webhook */}
        <div style={sectionStyle}>
          <h2 style={sectionTitle}>Webhook</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: 0 }}>
            Configure esse URL na Evolution API com o evento <code>messages.upsert</code>
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              readOnly
              style={{ ...inputStyle, flex: 1, marginTop: 0, cursor: "text" }}
              value={webhookUrl}
            />
            <button
              type="button"
              onClick={copyWebhook}
              style={{
                padding: "10px 16px",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Copiar
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={status === "saving"}
          style={{
            padding: "12px 32px",
            backgroundColor: "var(--accent-amber)",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: status === "saving" ? "not-allowed" : "pointer",
            opacity: status === "saving" ? 0.7 : 1,
          }}
        >
          {status === "saving" ? "Salvando..." : status === "saved" ? "Salvo!" : "Salvar"}
        </button>
        {status === "error" && (
          <span style={{ marginLeft: "16px", color: "#ef4444", fontSize: "14px" }}>
            Erro ao salvar
          </span>
        )}
      </form>
    </div>
  );
}
