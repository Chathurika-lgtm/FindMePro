"use client";

import { FormEvent, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { getPublicWorkerById } from "@/services/worker.service";
import { createBooking } from "@/services/booking.service";

const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          marginTop: "20px",
          height: "380px",
          borderRadius: "14px",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        Loading map...
      </div>
    ),
  },
);

type WorkerService = {
  id: string;
  category?: {
    id?: string;
    name?: string;
    icon?: string | null;
    description?: string | null;
  };
  categoryId?: string;
  serviceDescription?: string | null;
  servicePrice?: string | number;
  experienceYears?: number;
  isActive?: boolean;
  workerId?: string;
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();

  const workerId = params.workerId as string;

  // =====================================================
  // Worker / Service
  // =====================================================

  const [services, setServices] = useState<WorkerService[]>([]);
  const [workerName, setWorkerName] = useState("");
  const [workerLoading, setWorkerLoading] = useState(true);

  const [workerServiceId, setWorkerServiceId] = useState("");

  // =====================================================
  // Booking
  // =====================================================

  const [bookingDate, setBookingDate] = useState("");
  const [estimatedDuration, setEstimatedDuration] =
    useState("");
  const [description, setDescription] = useState("");

  // =====================================================
  // Location
  // =====================================================

  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // =====================================================
  // UI
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // Load Worker
  // =====================================================

  useEffect(() => {
    const loadWorker = async () => {
      try {
        setWorkerLoading(true);
        setError("");

        const workerData =
          await getPublicWorkerById(workerId);

        console.log(
          "Worker booking data:",
          workerData,
        );

        const data = workerData as any;

        // -------------------------------------------------
        // Worker Name
        // -------------------------------------------------

        const firstName =
          data?.user?.firstName ||
          data?.profile?.firstName ||
          "";

        const lastName =
          data?.user?.lastName ||
          data?.profile?.lastName ||
          "";

        const fullName =
          `${firstName} ${lastName}`.trim();

        setWorkerName(
          fullName ||
            data?.name ||
            data?.user?.name ||
            "Selected Worker",
        );

        // -------------------------------------------------
        // Worker Services
        // -------------------------------------------------

        let workerServices: WorkerService[] = [];

        if (Array.isArray(data?.services)) {
          workerServices = data.services;
        } else if (Array.isArray(data?.service)) {
          workerServices = data.service;
        } else if (data?.service?.id) {
          workerServices = [data.service];
        }

        console.log(
          "Available worker services:",
          workerServices,
        );

        setServices(workerServices);

        // -------------------------------------------------
        // Automatically select first active service
        // -------------------------------------------------

        const activeService =
          workerServices.find(
            (service) => service.isActive !== false,
          );

        if (activeService) {
          setWorkerServiceId(
            activeService.id,
          );
        } else if (workerServices.length > 0) {
          setWorkerServiceId(
            workerServices[0].id,
          );
        } else {
          setWorkerServiceId("");
        }
      } catch (err: any) {
        console.error(
          "Load worker error:",
          err,
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load worker information.",
        );
      } finally {
        setWorkerLoading(false);
      }
    };

    if (workerId) {
      loadWorker();
    }
  }, [workerId]);

  // =====================================================
  // Submit Booking
  // =====================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------
    // Validation
    // -------------------------------------------------

    if (!workerServiceId) {
      setError(
        "Please select a service before booking.",
      );
      return;
    }

    if (!bookingDate) {
      setError(
        "Please select a booking date and time.",
      );
      return;
    }

    if (!address.trim()) {
      setError(
        "Please enter your service address.",
      );
      return;
    }

    if (!latitude || !longitude) {
      setError(
        "Please select your service location on the map.",
      );
      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------
      // Create Booking Payload
      // -------------------------------------------------

      const bookingData = {
        workerId,

        workerServiceId,

        bookingDate: new Date(
          bookingDate,
        ).toISOString(),

        ...(estimatedDuration
          ? {
              estimatedDuration:
                Number(estimatedDuration),
            }
          : {}),

        ...(description.trim()
          ? {
              description:
                description.trim(),
            }
          : {}),

        address: address.trim(),

        latitude: Number(latitude),

        longitude: Number(longitude),
      };

      console.log(
        "Creating booking:",
        bookingData,
      );

      await createBooking(bookingData);

      setSuccess(
        "Booking request created successfully.",
      );

      setTimeout(() => {
        router.push("/bookings");
      }, 1000);
    } catch (err: any) {
      console.error(
        "Create booking error:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "Failed to create booking. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Loading
  // =====================================================

  if (workerLoading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingCard}>
            <div style={styles.loadingText}>
              Loading worker information...
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // Page
  // =====================================================

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        {/* Back */}
        <button
          type="button"
          style={styles.backButton}
          onClick={() => router.back()}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconBox}>
            <CalendarDays size={28} />
          </div>

          <div>
            <h1 style={styles.title}>
              Book a Worker
            </h1>

            <p style={styles.subtitle}>
              {workerName
                ? `Book ${workerName}`
                : "Enter your booking details below."}
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <form
          onSubmit={handleSubmit}
          style={styles.card}
        >

          {/* =================================================
              SERVICE
          ================================================= */}

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Select Service
            </h2>

            {services.length === 0 ? (
              <div style={styles.warning}>
                This worker currently has no
                available services for booking.
              </div>
            ) : (
              <>
                <label style={styles.label}>
                  Worker Service *
                </label>

                <select
                  value={workerServiceId}
                  onChange={(event) =>
                    setWorkerServiceId(
                      event.target.value,
                    )
                  }
                  style={styles.input}
                  disabled={loading}
                >
                  <option value="">
                    Select a service
                  </option>

                  {services.map((service) => (
                    <option
                      key={service.id}
                      value={service.id}
                    >
                      {service.category?.name ||
                        "Worker Service"}
                    </option>
                  ))}
                </select>

                {/* Selected Service */}
                {workerServiceId && (
                  <div style={styles.serviceInfo}>
                    {(() => {
                      const selectedService =
                        services.find(
                          (service) =>
                            service.id ===
                            workerServiceId,
                        );

                      if (!selectedService) {
                        return null;
                      }

                      return (
                        <>
                          <div
                            style={
                              styles.serviceName
                            }
                          >
                            {selectedService.category
                              ?.name ||
                              "Worker Service"}
                          </div>

                          {selectedService.serviceDescription && (
                            <div
                              style={
                                styles.serviceDescription
                              }
                            >
                              {
                                selectedService.serviceDescription
                              }
                            </div>
                          )}

                          {selectedService.servicePrice !==
                            undefined && (
                            <div
                              style={
                                styles.servicePrice
                              }
                            >
                              Service Price: Rs.{" "}
                              {Number(
                                selectedService.servicePrice,
                              ).toLocaleString()}
                            </div>
                          )}

                          {selectedService.experienceYears !==
                            undefined && (
                            <div
                              style={
                                styles.serviceExperience
                              }
                            >
                              Experience:{" "}
                              {
                                selectedService.experienceYears
                              }{" "}
                              years
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </div>

          {/* =================================================
              BOOKING DETAILS
          ================================================= */}

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Booking Details
            </h2>

            {/* Date */}
            <label style={styles.label}>
              Booking Date & Time *
            </label>

            <input
              type="datetime-local"
              value={bookingDate}
              onChange={(event) =>
                setBookingDate(
                  event.target.value,
                )
              }
              style={styles.input}
              disabled={loading}
            />

            {/* Duration */}
            <label style={styles.label}>
              Estimated Duration (hours)
            </label>

            <input
              type="number"
              min="1"
              value={estimatedDuration}
              onChange={(event) =>
                setEstimatedDuration(
                  event.target.value,
                )
              }
              placeholder="Example: 3"
              style={styles.input}
              disabled={loading}
            />

            {/* Description */}
            <label style={styles.label}>
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Describe the work you need..."
              rows={5}
              style={styles.textarea}
              disabled={loading}
            />
          </div>

          {/* =================================================
              LOCATION
          ================================================= */}

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Service Location
            </h2>

            {/* Address */}
            <label style={styles.label}>
              Address *
            </label>

            <textarea
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value,
                )
              }
              placeholder="Enter the full service address"
              rows={3}
              style={styles.textarea}
              disabled={loading}
            />

            {/* Coordinates */}
            <div style={styles.coordinateGrid}>

              <div>
                <label style={styles.label}>
                  Latitude *
                </label>

                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(event) =>
                    setLatitude(
                      event.target.value,
                    )
                  }
                  placeholder="Example: 6.9271"
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Longitude *
                </label>

                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(event) =>
                    setLongitude(
                      event.target.value,
                    )
                  }
                  placeholder="Example: 79.8612"
                  style={styles.input}
                  disabled={loading}
                />
              </div>

            </div>

            {/* Map */}
            <LocationPicker
              latitude={
                latitude
                  ? Number(latitude)
                  : null
              }
              longitude={
                longitude
                  ? Number(longitude)
                  : null
              }
              onLocationSelect={(
                selectedLatitude,
                selectedLongitude,
              ) => {
                setLatitude(
                  selectedLatitude.toString(),
                );

                setLongitude(
                  selectedLongitude.toString(),
                );
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={styles.success}>
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              loading ||
              services.length === 0
            }
            style={{
              ...styles.submitButton,
              opacity:
                loading ||
                services.length === 0
                  ? 0.7
                  : 1,
            }}
          >
            {loading
              ? "Creating Booking..."
              : "Confirm Booking"}
          </button>

        </form>
      </div>
    </main>
  );
}

// =====================================================
// Styles
// =====================================================

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "40px 20px",
  },

  container: {
    maxWidth: "850px",
    margin: "0 auto",
  },

  loadingCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "60px 30px",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
    textAlign: "center",
  },

  loadingText: {
    color: "#475569",
    fontSize: "16px",
    fontWeight: 600,
  },

  backButton: {
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    color: "#475569",
    fontSize: "15px",
    fontWeight: 600,
    padding: "8px 0",
    marginBottom: "25px",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "25px",
  },

  iconBox: {
    width: "58px",
    height: "58px",
    borderRadius: "14px",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 800,
    color: "#0f172a",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "30px",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  section: {
    marginBottom: "28px",
  },

  sectionTitle: {
    margin: "0 0 20px",
    fontSize: "20px",
    fontWeight: 750,
    color: "#0f172a",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "16px",
    fontSize: "14px",
    fontWeight: 650,
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },

  coordinateGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  serviceInfo: {
    marginTop: "14px",
    padding: "16px",
    borderRadius: "10px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  },

  serviceName: {
    color: "#1e3a8a",
    fontSize: "17px",
    fontWeight: 700,
  },

  serviceDescription: {
    marginTop: "7px",
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  servicePrice: {
    marginTop: "10px",
    color: "#166534",
    fontSize: "14px",
    fontWeight: 700,
  },

  serviceExperience: {
    marginTop: "6px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 600,
  },

  warning: {
    padding: "14px",
    borderRadius: "10px",
    background: "#fef3c7",
    border: "1px solid #fcd34d",
    color: "#92400e",
    fontSize: "14px",
    fontWeight: 600,
  },

  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: 600,
  },

  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: 600,
  },

  submitButton: {
    width: "100%",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
  },
};