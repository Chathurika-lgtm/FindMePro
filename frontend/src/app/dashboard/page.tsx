"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Search,
  ClipboardList,
  UserRound,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  BriefcaseBusiness,
  RefreshCw,
  MapPin,
} from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";

import { getProfile } from "@/services/auth.service";

import {
  getMyBookings,
  getWorkerBookings,
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

const formatDate = (date?: string) => {
  if (!date) {
    return "Date not available";
  }

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatAmount = (amount?: number) => {
  if (amount === undefined || amount === null) {
    return "Rs. 0";
  }

  return `Rs. ${Number(amount).toLocaleString("en-LK")}`;
};

const getStatusClasses = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700";

    case "ACCEPTED":
      return "bg-blue-50 text-blue-700";

    case "ON_THE_WAY":
      return "bg-indigo-50 text-indigo-700";

    case "WORKING":
      return "bg-violet-50 text-violet-700";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";

    case "REJECTED":
      return "bg-red-50 text-red-700";

    case "CANCELLED":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-500";

    case "ACCEPTED":
      return "bg-blue-500";

    case "ON_THE_WAY":
      return "bg-indigo-500";

    case "WORKING":
      return "bg-violet-500";

    case "COMPLETED":
      return "bg-emerald-500";

    case "REJECTED":
      return "bg-red-500";

    case "CANCELLED":
      return "bg-gray-500";

    default:
      return "bg-slate-500";
  }
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [bookings, setBookings] = useState<CustomerBooking[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // -----------------------------------------
      // Get logged-in user profile
      // -----------------------------------------

      const profileResponse: ProfileResponse = await getProfile();

      const currentUser = profileResponse.user;

      setUser(currentUser);

      // -----------------------------------------
      // CUSTOMER
      // -----------------------------------------

      if (currentUser.role === "CUSTOMER") {
        const bookingsResponse = await getMyBookings();

        setBookings(bookingsResponse);

        return;
      }

      // -----------------------------------------
      // WORKER
      // -----------------------------------------

      if (currentUser.role === "WORKER") {
        const bookingsResponse = await getWorkerBookings();

        setBookings(bookingsResponse);

        return;
      }

      // -----------------------------------------
      // ADMIN
      // -----------------------------------------

      if (currentUser.role === "ADMIN") {
        setError("Admin dashboard is not available yet.");

        return;
      }
    } catch (err: any) {
      console.error("Dashboard loading error:", err);

      const message =
        err?.response?.data?.message ||
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

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================
  // CUSTOMER STATISTICS
  // ==========================================

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const activeBookings = bookings.filter((booking) =>
    [
      "ACCEPTED",
      "ON_THE_WAY",
      "WORKING",
    ].includes(booking.status),
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  const cancelledBookings = bookings.filter((booking) =>
    [
      "CANCELLED",
      "REJECTED",
    ].includes(booking.status),
  ).length;

  const completedSpend = bookings
    .filter(
      (booking) => booking.status === "COMPLETED",
    )
    .reduce(
      (total, booking) =>
        total + Number(booking.totalAmount || 0),
      0,
    );

  // ==========================================
  // WORKER STATISTICS
  // ==========================================

  const workerPending = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const workerActive = bookings.filter((booking) =>
    [
      "ACCEPTED",
      "ON_THE_WAY",
      "WORKING",
    ].includes(booking.status),
  ).length;

  const workerCompleted = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  const workerCompletedValue = bookings
    .filter(
      (booking) => booking.status === "COMPLETED",
    )
    .reduce(
      (total, booking) =>
        total + Number(booking.totalAmount || 0),
      0,
    );

  // ==========================================
  // RECENT BOOKINGS
  // ==========================================

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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] bg-slate-50 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <div className="animate-pulse">
              <div className="h-6 w-40 rounded bg-slate-200" />

              <div className="mt-4 h-10 w-80 rounded bg-slate-200" />

              <div className="mt-3 h-5 w-[500px] max-w-full rounded bg-slate-100" />

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-32 rounded-2xl bg-white"
                    />
                  ),
                )}
              </div>

              <div className="mt-8 h-72 rounded-2xl bg-white" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] bg-slate-50 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                  !
                </div>

                <div>
                  <h1 className="text-lg font-bold text-red-800">
                    Dashboard Error
                  </h1>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadDashboard}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <RefreshCw
                      size={16}
                    />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ==========================================
  // WORKER DASHBOARD
  // ==========================================

  if (
    user?.role === "WORKER"
  ) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 p-5 sm:p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">

            {/* Header */}

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700">
                  <span className="h-2 w-2 rounded-full bg-violet-600" />
                  Worker Dashboard
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Welcome, {user.fullName}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Manage your service requests,
                  track active jobs, and monitor
                  your completed work.
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboard}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {/* Worker Statistics */}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Total */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Requests
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {bookings.length}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CalendarDays size={22} />
                  </div>
                </div>
              </div>

              {/* Pending */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Pending
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {workerPending}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Clock3 size={22} />
                  </div>
                </div>
              </div>

              {/* Active */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Active Jobs
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {workerActive}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <BriefcaseBusiness
                      size={22}
                    />
                  </div>
                </div>
              </div>

              {/* Completed */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Completed
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {workerCompleted}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings */}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Completed Booking Value
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {formatAmount(
                      workerCompletedValue,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Based on completed bookings.
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-bold text-emerald-600">
                  Rs
                </div>
              </div>
            </div>

            {/* Recent Requests */}

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Recent Service Requests
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest bookings from your customers.
                  </p>
                </div>

                <Link
                  href="/worker-bookings"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700"
                >
                  View All
                  <ArrowRight size={16} />
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <BriefcaseBusiness
                      size={25}
                    />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No service requests yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    New customer booking
                    requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentBookings.map(
                    (booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <CalendarDays
                              size={19}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Booking ID
                            </p>

                            <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-800">
                              {booking.id}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(
                                booking.bookingDate,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-bold text-slate-800">
                            {formatAmount(
                              booking.totalAmount,
                            )}
                          </span>

                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                              booking.status,
                            )}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${getStatusDot(
                                booking.status,
                              )}`}
                            />

                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Worker Quick Actions */}

            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-900">
                Quick Actions
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <Link
                  href="/worker-bookings"
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <ClipboardList size={23} />
                    </div>

                    <ArrowRight
                      size={19}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600"
                    />
                  </div>

                  <h3 className="mt-5 font-bold text-slate-900">
                    Service Requests
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    View and manage customer
                    booking requests.
                  </p>
                </Link>

                <Link
                  href="/profile"
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <UserRound size={23} />
                    </div>

                    <ArrowRight
                      size={19}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                    />
                  </div>

                  <h3 className="mt-5 font-bold text-slate-900">
                    My Profile
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    View and update your worker
                    profile information.
                  </p>
                </Link>

                <Link
                  href="/workers"
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Search size={23} />
                    </div>

                    <ArrowRight
                      size={19}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                    />
                  </div>

                  <h3 className="mt-5 font-bold text-slate-900">
                    FindMePro
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Browse the service marketplace.
                  </p>
                </Link>
              </div>
            </div>

            {/* Worker Account Information */}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Name
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {user.fullName}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {user.email}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {user.phone || "Not added"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Account Status
                </p>

                <p
                  className={`mt-2 font-semibold ${
                    user.status === "ACTIVE"
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {user.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ==========================================
  // CUSTOMER DASHBOARD
  // ==========================================

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 p-5 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">

          {/* Header */}

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Customer Dashboard
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Welcome, {user?.fullName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage your service bookings and
                find trusted workers through
                FindMePro.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Statistics */}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Bookings
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {totalBookings}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarDays size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {activeBookings}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Clock3 size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Completed
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {completedBookings}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Completed Spend
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatAmount(
                      completedSpend,
                    )}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <span className="text-sm font-bold">
                    Rs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recent Bookings
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track your latest service requests.
                </p>
              </div>

              <Link
                href="/bookings"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ClipboardList size={25} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  No bookings yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Find a trusted worker and book a
                  service to get started.
                </p>

                <Link
                  href="/workers"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Find Workers
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBookings.map(
                  (booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <CalendarDays
                            size={19}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Booking ID
                          </p>

                          <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-800">
                            {booking.id}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(
                              booking.bookingDate,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-bold text-slate-800">
                          {formatAmount(
                            booking.totalAmount,
                          )}
                        </span>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                            booking.status,
                          )}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${getStatusDot(
                              booking.status,
                            )}`}
                          />

                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}

          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <Link
                href="/workers"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Search size={23} />
                  </div>

                  <ArrowRight
                    size={19}
                    className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                  />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  Find Workers
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Find trusted service workers
                  for your needs.
                </p>
              </Link>

              <Link
                href="/bookings"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <ClipboardList size={23} />
                  </div>

                  <ArrowRight
                    size={19}
                    className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-600"
                  />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  My Bookings
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View and manage your service
                  bookings.
                </p>
              </Link>

              <Link
                href="/profile"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <UserRound size={23} />
                  </div>

                  <ArrowRight
                    size={19}
                    className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                  />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  My Profile
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View and update your personal
                  information.
                </p>
              </Link>
            </div>
          </div>

          {/* Account Information */}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Name
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {user?.fullName}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                {user?.email}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Phone
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {user?.phone ||
                  "Not added"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account Status
              </p>

              <p
                className={`mt-2 font-semibold ${
                  user?.status === "ACTIVE"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {user?.status}
              </p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}