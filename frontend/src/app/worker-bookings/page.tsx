"use client";

import { useEffect, useState } from "react";
import {
  getWorkerBookings,
  acceptBooking,
  markBookingOnTheWay,
  startBookingWork,
  completeBookingWork,
  CustomerBooking,
} from "@/services/booking.service";

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
    description:
      "Waiting for you to accept this service request.",
  },

  ACCEPTED: {
    label: "Accepted",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    description:
      "You have accepted this booking. Start your journey when you are ready.",
  },

  ON_THE_WAY: {
    label: "On the Way",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    description:
      "You are on the way to the customer's location. Start the work when you arrive.",
  },

  WORKING: {
    label: "Work in Progress",
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
    description:
      "This service is currently in progress.",
  },

  COMPLETED: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    description:
      "This service booking has been completed.",
  },

  REJECTED: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    description:
      "This booking was rejected.",
  },

  CANCELLED: {
    label: "Cancelled",
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-500",
    description:
      "This booking has been cancelled.",
  },
};

function formatDate(date?: string) {
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
}

function formatAmount(amount?: number) {
  if (amount === undefined || amount === null) {
    return "Rs. 0";
  }

  return `Rs. ${Number(amount).toLocaleString("en-LK")}`;
}

export default function WorkerBookingsPage() {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const [onTheWayId, setOnTheWayId] = useState<string | null>(null);

  const [startingWorkId, setStartingWorkId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getWorkerBookings();

      setBookings(data);
    } catch (err) {
      console.error(
        "Failed to load worker bookings:",
        err,
      );

      setError(
        "Unable to load booking requests. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAcceptBooking = async (
    bookingId: string,
  ) => {
    try {
      setAcceptingId(bookingId);
      setError("");
      setSuccess("");

      await acceptBooking(bookingId);

      setSuccess(
        "Booking accepted successfully.",
      );

      await loadBookings();
    } catch (err) {
      console.error(
        "Failed to accept booking:",
        err,
      );

      setError(
        "Failed to accept booking. Please try again.",
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const handleOnTheWay = async (
    bookingId: string,
  ) => {
    try {
      setOnTheWayId(bookingId);
      setError("");
      setSuccess("");

      await markBookingOnTheWay(bookingId);

      setSuccess(
        "Booking status updated to On The Way.",
      );

      await loadBookings();
    } catch (err) {
      console.error(
        "Failed to update booking status:",
        err,
      );

      setError(
        "Failed to update booking status. Please try again.",
      );
    } finally {
      setOnTheWayId(null);
    }
  };

  
  const handleStartWork = async (
    bookingId: string,
  ) => {
    try {
      setStartingWorkId(bookingId);
      setError("");
      setSuccess("");

      await startBookingWork(bookingId);

      setSuccess(
        "Work started successfully.",
      );

      await loadBookings();
    } catch (err) {
      console.error(
        "Failed to start work:",
        err,
      );

      setError(
        "Failed to start work. Please try again.",
      );
    } finally {
      setStartingWorkId(null);
    }
  };

    const handleCompleteWork = async (
    bookingId: string,
  ) => {
    try {
      setError("");
      setSuccess("");

      await completeBookingWork(bookingId);

      setSuccess(
        "Work completed successfully.",
      );

      await loadBookings();
    } catch (err) {
      console.error(
        "Failed to complete work:",
        err,
      );

      setError(
        "Failed to complete work. Please try again.",
      );
    }
  };

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.status === "PENDING",
  ).length;

  const activeBookings = bookings.filter(
    (booking) =>
      booking.status === "ACCEPTED" ||
      booking.status === "ON_THE_WAY" ||
      booking.status === "WORKING",
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "COMPLETED",
  ).length;

  const completedEarnings = bookings
    .filter(
      (booking) =>
        booking.status === "COMPLETED",
    )
    .reduce(
      (total, booking) =>
        total +
        Number(booking.totalAmount || 0),
      0,
    );

    
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 h-10 w-72 animate-pulse rounded bg-slate-200" />

            <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-slate-100" />
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-8 space-y-5">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700">
              <span className="h-2 w-2 rounded-full bg-violet-600" />
              Worker Dashboard
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Service Requests
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage booking requests from your customers.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-800">
                  Unable to load bookings
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

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
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700">
                <span className="h-2 w-2 rounded-full bg-violet-600" />
                Worker Dashboard
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Service Requests
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage customer bookings, accept new
                requests, and track your service work.
              </p>
            </div>

            <button
              type="button"
              onClick={loadBookings}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
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
        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
              ✓
            </span>

            {success}
          </div>
        )}

        {/* Error Message */}
        {error && bookings.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
              !
            </span>

            {error}
          </div>
        )}

        {/* Statistics */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Total */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Requests
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
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="17"
                      rx="2"
                    />
                    <path d="M8 2v4M16 2v4M3 10h18" />
                  </svg>
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
                    {pendingBookings}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500" />
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
                    {activeBookings}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                  <span className="h-3 w-3 rounded-full bg-violet-500" />
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

            {/* Earnings */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Completed Value
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatAmount(completedEarnings)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <span className="text-sm font-bold">
                    Rs
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <svg
                className="h-8 w-8"
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
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No service requests yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              New customer booking requests will appear
              here when someone books one of your services.
            </p>
          </div>
        )}

        {/* Booking Requests */}
        {bookings.length > 0 && (
          <div className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Customer Requests
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review and manage your service bookings.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {bookings.length} request
                {bookings.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-5">
              {bookings.map((booking) => {
                const status =
                  statusConfig[booking.status] ||
                  statusConfig.PENDING;

                return (
                  <article
                    key={booking.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Top */}
                    <div className="border-b border-slate-100 p-5 sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
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

                      {/* Details */}
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Service Date
                          </p>

                          <p className="mt-2 text-sm font-semibold text-slate-800">
                            {formatDate(
                              booking.bookingDate,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Booking Value
                          </p>

                          <p className="mt-2 text-lg font-bold text-slate-900">
                            {formatAmount(
                              booking.totalAmount,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Request Status
                          </p>

                          <p
                            className={`mt-2 text-sm font-semibold ${status.text}`}
                          >
                            {status.label}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col gap-4 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {status.description}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Booking created{" "}
                          {booking.createdAt
                            ? formatDate(
                                booking.createdAt,
                              )
                            : "recently"}
                        </p>
                      </div>

                      {/* PENDING */}
                      {booking.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleAcceptBooking(
                              booking.id,
                            )
                          }
                          disabled={
                            acceptingId === booking.id
                          }
                          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {acceptingId === booking.id ? (
                            <>
                              <svg
                                className="h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9"
                                  className="opacity-30"
                                />

                                <path d="M21 12a9 9 0 0 0-9-9" />
                              </svg>

                              Accepting...
                            </>
                          ) : (
                            <>
                              <span className="text-base">
                                ✓
                              </span>

                              Accept Booking
                            </>
                          )}
                        </button>
                      ) : booking.status === "ACCEPTED" ? (
                        /* ACCEPTED */
                        <button
                          type="button"
                          onClick={() =>
                            handleOnTheWay(
                              booking.id,
                            )
                          }
                          disabled={
                            onTheWayId === booking.id
                          }
                          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {onTheWayId === booking.id ? (
                            <>
                              <svg
                                className="h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9"
                                  className="opacity-30"
                                />

                                <path d="M21 12a9 9 0 0 0-9-9" />
                              </svg>

                              Updating...
                            </>
                          ) : (
                            <>
                              <span className="text-base">
                                →
                              </span>

                              Start Journey
                            </>
                          )}
                        </button>
                      ) : booking.status === "ON_THE_WAY" ? (
                        /* ON THE WAY */
                        <button
                          type="button"
                          onClick={() =>
                            handleStartWork(
                              booking.id,
                            )
                          }
                          disabled={
                            startingWorkId === booking.id
                          }
                          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {startingWorkId === booking.id ? (
                            <>
                              <svg
                                className="h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9"
                                  className="opacity-30"
                                />

                                <path d="M21 12a9 9 0 0 0-9-9" />
                              </svg>

                              Starting...
                            </>
                          ) : (
                            <>
                              <span className="text-base">
                                ▶
                              </span>

                              Start Work
                            </>
                          )}
                        </button>
                      ) : booking.status === "WORKING" ? (
  /* WORKING */
  <button
    type="button"
    onClick={() =>
      handleCompleteWork(
        booking.id,
      )
    }
    className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
  >
    <span className="text-base">
      ✓
    </span>

    Complete Work
  </button>
) : booking.status === "COMPLETED" ? (
                        /* COMPLETED */
                        <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-5 py-3 text-sm font-bold text-emerald-700">
                          <span>✓</span>

                          Job Completed
                        </span>
                      ) : (
                        /* REJECTED / CANCELLED / OTHER */
                        <span className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                          <span
                            className={`h-2 w-2 rounded-full ${status.dot}`}
                          />

                          {status.label}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            
          </div>
        )}
      </div>
      
    </main>
  );
  
}
