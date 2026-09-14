"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/token";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <header
      style={{
        height: "70px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          textDecoration: "none",
          fontSize: "26px",
          fontWeight: "700",
          color: "#123b72",
        }}
      >
        FindMe<span style={{ color: "#f59e0b" }}>Pro</span>
      </Link>

      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#374151",
            fontSize: "15px",
          }}
        >
          Home
        </Link>

        <Link
          href="/profile"
          style={{
            textDecoration: "none",
            color: "#374151",
            fontSize: "15px",
          }}
        >
          Profile
        </Link>

        <button
          onClick={handleLogout}
          style={{
            border: "none",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}