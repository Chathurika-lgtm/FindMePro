"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ClipboardList,
  UserRound,
  ArrowRight,
} from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";
import { getProfile } from "@/services/auth.service";
import {
  getMyBookings,
  CustomerBooking,
} from "@/services/booking.service";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "WORKER" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE";
  gender?: string | null;
  profileImage?: string | null;
}

interface ProfileResponse {
  message?: string;
  user: UserProfile;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileResponse, bookingsResponse] =
          await Promise.all([
            getProfile(),
            getMyBookings(),
          ]);

        console.log("Dashboard profile:", profileResponse);
        console.log("Dashboard bookings:", bookingsResponse);

        setUser(profileResponse.user);
        setBookings(bookingsResponse);
      } catch (error: any) {
        console.error(
          "Dashboard loading error:",
          error,
        );

        const message =
          error?.response?.data?.message ||
          "Unable to load dashboard.";

        setError(
          Array.isArray(message)
            ? message.join(", ")
            : message,
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter((booking) =>
    [
      "PENDING",
      "ACCEPTED",
      "ON_THE_WAY",
      "IN_PROGRESS",
    ].includes(booking.status),
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  const cancelledBookings = bookings.filter((booking) =>
    ["CANCELLED", "REJECTED"].includes(booking.status),
  ).length;

  const recentBookings = [...bookings]
    .sort((a, b) => {
      const dateA = new Date(
        a.createdAt || 0,
      ).getTime();

      const dateB = new Date(
        b.createdAt || 0,
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <MainLayout>
      <div>
        {/* =========================
            LOADING
        ========================= */}
        {loading && (
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                color: "#123b72",
              }}
            >
              Loading...
            </h1>

            <p
              style={{
                marginTop: "10px",
                color: "#6b7280",
              }}
            >
              Loading your dashboard...
            </p>
          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}
        {!loading && error && (
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                color: "#123b72",
              }}
            >
              Dashboard
            </h1>

            <p
              style={{
                marginTop: "10px",
                color: "#dc2626",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* =========================
            DASHBOARD
        ========================= */}
        {!loading && !error && user && (
          <div>
            {/* =========================
                WELCOME
            ========================= */}
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                  color: "#123b72",
                }}
              >
                Welcome, {user.fullName}
              </h1>

              <p
                style={{
                  marginTop: "10px",
                  color: "#6b7280",
                }}
              >
                Welcome back to your FindMePro dashboard.
              </p>
            </div>

            {/* =========================
                BOOKING STATISTICS
            ========================= */}
            <div
              style={{
                marginTop: "30px",
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              {/* Total Bookings */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 15px rgba(0, 0, 0, 0.06)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  TOTAL BOOKINGS
                </p>

                <h2
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    fontSize: "30px",
                    color: "#123b72",
                  }}
                >
                  {totalBookings}
                </h2>
              </div>

              {/* Pending Bookings */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 15px rgba(0, 0, 0, 0.06)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  PENDING BOOKINGS
                </p>

                <h2
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    fontSize: "30px",
                    color: "#d97706",
                  }}
                >
                  {pendingBookings}
                </h2>
              </div>

              {/* Completed */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 15px rgba(0, 0, 0, 0.06)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  COMPLETED
                </p>

                <h2
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    fontSize: "30px",
                    color: "#16a34a",
                  }}
                >
                  {completedBookings}
                </h2>
              </div>

              {/* Cancelled */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 15px rgba(0, 0, 0, 0.06)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  CANCELLED
                </p>

                <h2
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    fontSize: "30px",
                    color: "#dc2626",
                  }}
                >
                  {cancelledBookings}
                </h2>
              </div>
            </div>

            {/* =========================
                RECENT BOOKINGS
            ========================= */}
            <div
              style={{
                marginTop: "30px",
                background: "#ffffff",
                borderRadius: "12px",
                padding: "24px",
                boxShadow:
                  "0 4px 15px rgba(0, 0, 0, 0.06)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#123b72",
                  fontSize: "20px",
                }}
              >
                Recent Bookings
              </h2>

              {recentBookings.length === 0 ? (
                <p
                  style={{
                    marginTop: "16px",
                    color: "#6b7280",
                  }}
                >
                  You do not have any bookings yet.
                </p>
              ) : (
                <div
                  style={{
                    marginTop: "18px",
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      style={{
                        padding: "16px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          Booking #{booking.id}
                        </p>

                        {booking.bookingDate && (
                          <p
                            style={{
                              margin: "5px 0 0",
                              color: "#6b7280",
                              fontSize: "14px",
                            }}
                          >
                            {new Date(
                              booking.bookingDate,
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          background: "#eef2ff",
                          color: "#123b72",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* =========================
                QUICK ACTIONS
            ========================= */}
            <div
              style={{
                marginTop: "30px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#123b72",
                  fontSize: "20px",
                }}
              >
                Quick Actions
              </h2>

              <div
                style={{
                  marginTop: "18px",
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                }}
              >
                {/* =========================
                    FIND WORKERS
                ========================= */}
                <Link
                  href="/workers"
                  style={{
                    textDecoration: "none",
                    background: "#ffffff",
                    borderRadius: "14px",
                    padding: "22px",
                    boxShadow:
                      "0 4px 15px rgba(0, 0, 0, 0.06)",
                    display: "block",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "14px",
                        background: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Search
                        size={28}
                        strokeWidth={2}
                        color="#2563eb"
                      />
                    </div>

                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ArrowRight
                        size={18}
                        color="#2563eb"
                      />
                    </div>
                  </div>

                  <h3
                    style={{
                      margin: "16px 0 6px",
                      color: "#123b72",
                      fontSize: "18px",
                    }}
                  >
                    Find Workers
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    Find trusted service workers near you.
                  </p>
                </Link>

                {/* =========================
                    MY BOOKINGS
                ========================= */}
                <Link
                  href="/bookings"
                  style={{
                    textDecoration: "none",
                    background: "#ffffff",
                    borderRadius: "14px",
                    padding: "22px",
                    boxShadow:
                      "0 4px 15px rgba(0, 0, 0, 0.06)",
                    display: "block",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "14px",
                        background: "#fff7ed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ClipboardList
                        size={28}
                        strokeWidth={2}
                        color="#f97316"
                      />
                    </div>

                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#fff7ed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ArrowRight
                        size={18}
                        color="#f97316"
                      />
                    </div>
                  </div>

                  <h3
                    style={{
                      margin: "16px 0 6px",
                      color: "#123b72",
                      fontSize: "18px",
                    }}
                  >
                    My Bookings
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    View and manage your service bookings.
                  </p>
                </Link>

                {/* =========================
                    MY PROFILE
                ========================= */}
                <Link
                  href="/profile"
                  style={{
                    textDecoration: "none",
                    background: "#ffffff",
                    borderRadius: "14px",
                    padding: "22px",
                    boxShadow:
                      "0 4px 15px rgba(0, 0, 0, 0.06)",
                    display: "block",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "14px",
                        background: "#f0fdf4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <UserRound
                        size={28}
                        strokeWidth={2}
                        color="#16a34a"
                      />
                    </div>

                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#f0fdf4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ArrowRight
                        size={18}
                        color="#16a34a"
                      />
                    </div>
                  </div>

                  <h3
                    style={{
                      margin: "16px 0 6px",
                      color: "#123b72",
                      fontSize: "18px",
                    }}
                  >
                    My Profile
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    View and update your personal information.
                  </p>
                </Link>
              </div>
            </div>

            {/* =========================
                ACCOUNT INFORMATION
            ========================= */}
            <div
              style={{
                marginTop: "30px",
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              {/* Name */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 15px rgba(0, 0, 0, 0.06)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  NAME
                </p>

                <h2
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    fontSize: "20px",
                    color: "#123b72",
                  }}
                >
                  {user.fullName}
                </h2>
              </div>

              {/* Email */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 15px rgba(0, 0, 0, 0.06)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  EMAIL
                </p>

                <h2
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    fontSize: "17px",
                    color: "#111827",
                  }}
                >
                  {user.email}
                </h2>
              </div>

              {/* Phone */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 15px rgba(0, 0, 0, 0.06)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  PHONE
                </p>

                <h2
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    fontSize: "17px",
                    color: "#111827",
                  }}
                >
                  {user.phone || "Not added"}
                </h2>
              </div>

              {/* Account Status */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "22px",
                  boxShadow:
                    "0 4px 15px rgba(0, 0, 0, 0.06)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  ACCOUNT STATUS
                </p>

                <h2
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    fontSize: "17px",
                    color:
                      user.status === "ACTIVE"
                        ? "#16a34a"
                        : "#dc2626",
                  }}
                >
                  {user.status}
                </h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}