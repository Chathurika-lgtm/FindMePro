"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMyBookings,
  CustomerBooking,
  cancelBooking,
} from "@/services/booking.service";

const statusSteps = [
  "PENDING",
  "ACCEPTED",
  "ON_THE_WAY",
  "WORKING",
  "COMPLETED",
];

const statusConfig: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    dot: string;
    description: string;
  }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    description: "Waiting for the worker to accept your booking.",
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    description: "Your worker has accepted the booking.",
  },
  ON_THE_WAY: {
    label: "On the way",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    description: "The worker is on the way to your location.",
  },
  WORKING: {
    label: "Work in progress",
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
    description: "The worker is currently working on your service.",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    description: "This service booking has been completed.",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    description: "This booking was rejected by the worker.",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-500",
    description: "This booking has been cancelled.",
  },
};

function formatDate(date?: string) {
  if (!date) return "Date not available";

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAmount(amount?: number) {
  if (amount === undefined || amount === null) {
    return "Rs. 0";
  }

  return `Rs. ${Number(amount).toLocaleString("en-LK")}`;
}

function getProgressIndex(status: string) {
  return statusSteps.indexOf(status);
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("LATEST");
  const [closedBookingIds, setClosedBookingIds] = useState<string[]>([]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setError("Unable to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();

    try {
      const storedClosedBookingIds = window.localStorage.getItem(
        "findmepro_closed_booking_ids",
      );

      if (storedClosedBookingIds) {
        const parsedClosedBookingIds = JSON.parse(
          storedClosedBookingIds,
        );

        if (Array.isArray(parsedClosedBookingIds)) {
          setClosedBookingIds(
            parsedClosedBookingIds.filter(
              (id): id is string => typeof id === "string",
            ),
          );
        }
      }
    } catch (err) {
      console.error(
        "Failed to load closed booking IDs:",
        err,
      );
    }
  }, []);

  const handleCancelBooking = async (
    bookingId: string,
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await cancelBooking(bookingId);

      setSuccess(
        "Booking cancelled successfully.",
      );

      await loadBookings();
    } catch (err) {
      console.error(
        "Failed to cancel booking:",
        err,
      );

      setError(
        "Failed to cancel booking. Please try again.",
      );
    }
  };

  const handleCloseCancelledBooking = (
    bookingId: string,
  ) => {
    setClosedBookingIds((current) => {
      const updated = current.includes(bookingId)
        ? current
        : [...current, bookingId];

      window.localStorage.setItem(
        "findmepro_closed_booking_ids",
        JSON.stringify(updated),
      );

      return updated;
    });

    setSuccess("Cancelled booking closed successfully.");
  };

  const totalBookings = bookings.length;

  const activeBookings = bookings.filter(
    (booking) =>
      booking.status !== "COMPLETED" &&
      booking.status !== "CANCELLED" &&
      booking.status !== "REJECTED",
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  const totalSpent = bookings
    .filter((booking) => booking.status === "COMPLETED")
    .reduce((total, booking) => total + Number(booking.totalAmount || 0), 0);

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const rejectedBookings = bookings.filter(
    (booking) => booking.status === "REJECTED",
  ).length;

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = bookings.filter((booking) => {
      const normalizedStatus = booking.status
        .trim()
        .toUpperCase();

      const normalizedFilter = statusFilter
        .trim()
        .toUpperCase();

      if (
        closedBookingIds.includes(booking.id) &&
        normalizedFilter !== "CANCELLED"
      ) {
        return false;
      }

      const matchesStatus =
        normalizedFilter === "ALL" ||
        normalizedStatus === normalizedFilter;

      const matchesSearch =
        !query ||
        booking.id.toLowerCase().includes(query) ||
        normalizedStatus.toLowerCase().replaceAll("_", " ").includes(query);

      return matchesStatus && matchesSearch;
    });

    return [...result].sort((a, b) => {
      const dateA = new Date(a.bookingDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.bookingDate || b.createdAt || 0).getTime();

      if (sortOrder === "OLDEST") {
        return dateA - dateB;
      }

      if (sortOrder === "AMOUNT_HIGH") {
        return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
      }

      if (sortOrder === "AMOUNT_LOW") {
        return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
      }

      return dateB - dateA;
    });
  }, [
    bookings,
    searchQuery,
    statusFilter,
    sortOrder,
    closedBookingIds,
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Customer Dashboard
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                My Bookings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Track your service requests, worker progress, and completed
                bookings in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={loadBookings}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 11a8.1 8.1 0 0 0-15.5-3M4 5v4h4" />
                <path d="M4 13a8.1 8.1 0 0 0 15.5 3M20 19v-4h-4" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Statistics */}
        {!loading && !error && bookings.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M8 2v4M16 2v4M3 10h18" />
                  </svg>
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

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-violet-500" />
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

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
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
                    {formatAmount(totalSpent)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <span className="text-lg font-bold">Rs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-5">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="h-5 w-48 rounded bg-slate-200" />
                <div className="mt-4 h-4 w-72 rounded bg-slate-100" />
                <div className="mt-6 h-16 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-800">
                  Something went wrong
                </h2>

                <p className="mt-1 text-sm text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={loadBookings}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M8 2v4M16 2v4M3 10h18" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No bookings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You have not created any service bookings yet. Find a trusted
              worker and book a service when you are ready.
            </p>
          </div>
        )}

        {/* Success */}
        {!loading && success && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                ✓
              </div>

              <div>
                <p className="text-sm font-bold text-emerald-800">
                  Success
                </p>

                <p className="mt-0.5 text-sm text-emerald-700">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking List */}
        {!loading && !error && bookings.length > 0 && (
          <div>
            <div className="mb-5 flex flex-col gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      Booking History
                    </h2>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {filteredBookings.length} of {bookings.length}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Search, filter, and track all your service requests.
                  </p>
                </div>

                {(searchQuery || statusFilter !== "ALL" || sortOrder !== "LATEST") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
                      setSortOrder("LATEST");
                    }}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
                
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search by booking ID or status..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="ON_THE_WAY">On the way</option>
                    <option value="WORKING">Working</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="LATEST">Latest first</option>
                    <option value="OLDEST">Oldest first</option>
                    <option value="AMOUNT_HIGH">Highest amount</option>
                    <option value="AMOUNT_LOW">Lowest amount</option>
                  </select>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                    {pendingBookings} pending
                  </span>
                  <span className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                    {activeBookings} active
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                    {completedBookings} completed
                  </span>
                  {rejectedBookings > 0 && (
                    <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-700">
                      {rejectedBookings} rejected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  No matching bookings
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try a different booking ID, status filter, or clear the current filters.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
              {filteredBookings.map((booking) => {
                const status =
                  statusConfig[booking.status] || statusConfig.PENDING;

                const progressIndex = getProgressIndex(booking.status);
                const isNormalFlow = progressIndex >= 0;

                return (
                  <article
                    key={booking.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                  >
                    {/* Card Top */}
                    <div className="border-b border-slate-100 bg-gradient-to-br from-white via-white to-slate-50/70 p-5 sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm transition group-hover:bg-blue-600 group-hover:text-white">
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="17"
                                  rx="2"
                                />
                                <path d="M8 2v4M16 2v4M3 10h18" />
                              </svg>
                            </span>

                            <div>
                              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                Booking ID
                              </p>

                              <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-800">
                                {booking.id}
                              </p>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ${status.bg} ${status.text}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${status.dot}`}
                          />
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Booking Date
                          </p>

                          <p className="mt-2 text-sm font-semibold text-slate-800">
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Total Amount
                          </p>

                          <p className="mt-2 text-lg font-bold text-slate-900">
                            {formatAmount(booking.totalAmount)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Status
                          </p>

                          <p className={`mt-2 text-sm font-semibold ${status.text}`}>
                            {status.label}
                          </p>
                        </div>
                      </div>

                      <div className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${status.bg} ${status.text}`}>
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${status.dot} ${booking.status === "WORKING" || booking.status === "ON_THE_WAY" ? "animate-pulse" : ""}`} />
                        <div>
                          <p className="text-sm font-bold">{status.label}</p>
                          <p className="mt-0.5 text-xs opacity-80">{status.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    {isNormalFlow && (
                      <div className="px-5 py-6 sm:px-6">
                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">
                              Booking Progress
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {status.description}
                            </p>
                          </div>

                          <span className="hidden text-xs font-medium text-slate-400 sm:block">
                            Step {progressIndex + 1} of {statusSteps.length}
                          </span>
                        </div>

                        <div className="relative">
                          <div className="absolute left-0 right-0 top-4 hidden h-0.5 bg-slate-200 sm:block" />

                          <div
                            className="absolute left-0 top-4 hidden h-0.5 bg-blue-600 transition-all sm:block"
                            style={{
                              width:
                                progressIndex === 0
                                  ? "0%"
                                  : `${(progressIndex / (statusSteps.length - 1)) * 100}%`,
                            }}
                          />

                          <div className="relative grid grid-cols-5 gap-1">
                            {statusSteps.map((step, index) => {
                              const completed = index <= progressIndex;
                              const current = index === progressIndex;

                              return (
                                <div
                                  key={step}
                                  className="flex flex-col items-center text-center"
                                >
                                  <div
                                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                                      completed
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-200 bg-white text-slate-400"
                                    } ${
                                      current
                                        ? "ring-4 ring-blue-50"
                                        : ""
                                    }`}
                                  >
                                    {completed ? "✓" : index + 1}
                                  </div>

                                  <span
                                    className={`mt-2 text-[10px] font-semibold sm:text-xs ${
                                      completed
                                        ? "text-slate-700"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {step === "ON_THE_WAY"
                                      ? "On the way"
                                      : step === "WORKING"
                                        ? "Working"
                                        : step.charAt(0) +
                                          step.slice(1).toLowerCase()}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <p className="text-xs text-slate-500">
                        Booking created{" "}
                        {booking.createdAt
                          ? formatDate(booking.createdAt)
                          : "recently"}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        {booking.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCancelBooking(
                                booking.id,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                            Cancel Booking
                          </button>
                        )}

                        {booking.status === "CANCELLED" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCloseCancelledBooking(
                                booking.id,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                            Close
                          </button>
                        )}

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          FindMePro Service Booking
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}