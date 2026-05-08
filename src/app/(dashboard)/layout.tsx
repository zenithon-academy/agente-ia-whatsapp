import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import NavLinks from "./nav-links";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticatedServer();
  if (!authenticated) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "240px",
          minWidth: "240px",
          backgroundColor: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <NavLinks />
      </aside>

      <main
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
