"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Senha incorreta");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            color: "var(--text-primary)",
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Agente IA
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            textAlign: "center",
            marginBottom: "32px",
            fontSize: "14px",
          }}
        >
          Digite a senha para acessar o dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
              marginBottom: "16px",
            }}
          />

          {error && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "14px",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--accent-amber)",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
