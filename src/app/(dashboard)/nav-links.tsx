"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Chat de Teste", icon: "💬" },
  { href: "/conversations", label: "Conversas WhatsApp", icon: "📱" },
  { href: "/config", label: "Configurações", icon: "⚙️" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ padding: "24px 20px 16px" }}>
        <h2
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            color: "var(--accent-amber)",
            fontSize: "18px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Agente IA
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "4px 0 0" }}>
          WhatsApp Dashboard
        </p>
      </div>

      <div style={{ flex: 1, padding: "8px 12px" }}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "4px",
                textDecoration: "none",
                color: isActive ? "var(--accent-amber)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--bg-tertiary)" : "transparent",
                borderLeft: isActive ? "3px solid var(--accent-amber)" : "3px solid transparent",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>

      <div style={{ padding: "16px 12px" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px 12px",
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--text-secondary)",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
