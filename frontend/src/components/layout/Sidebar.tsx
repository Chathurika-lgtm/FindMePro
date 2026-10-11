"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getProfile } from "@/services/auth.service";

type UserRole = "CUSTOMER" | "WORKER" | "ADMIN";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: string;
}

interface ProfileResponse {
  message?: string;
  user: UserProfile;
}

export default function Sidebar() {
  const pathname = usePathname();

  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const response: ProfileResponse =
          await getProfile();

        setRole(response.user.role);
      } catch (error) {
        console.error(
          "Failed to load user role:",
          error,
        );
      }
    };

    loadUserRole();
  }, []);

  const bookingsHref =
    role === "WORKER"
      ? "/worker-bookings"
      : "/bookings";

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
    },
    {
      name: "Profile",
      href: "/profile",
    },
    {
      name: "Bookings",
      href: bookingsHref,
    },
    {
      name: "Messages",
      href: "/messages",
    },
  ];

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "calc(100vh - 70px)",
        backgroundColor: "#0f2f5f",
        padding: "24px 16px",
        boxSizing: "border-box",
      }}
    >
      {/* Menu Title */}
      <div
        style={{
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "18px",
          paddingLeft: "12px",
          opacity: 0.7,
        }}
      >
        Menu
      </div>

      {/* Menu Items */}
      <nav>
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: "block",
                textDecoration: "none",
                color: "#ffffff",
                backgroundColor: isActive
                  ? "#2563eb"
                  : "transparent",
                padding: "12px 14px",
                borderRadius: "8px",
                marginBottom: "6px",
                fontSize: "15px",
                fontWeight: isActive
                  ? "600"
                  : "400",
                transition:
                  "background-color 0.2s ease",
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}