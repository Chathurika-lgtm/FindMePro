"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  BriefcaseBusiness,
  Clock3,
  CheckCircle2,
  Phone,
  Image as ImageIcon,
  CalendarDays,
} from "lucide-react";

import {
  getPublicWorkerById,
  PublicWorker,
} from "@/services/worker.service";

const getImageUrl = (
  imagePath: string | null | undefined,
): string => {
  if (!imagePath) return "";

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) return imagePath;

  return `${apiUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const getDayName = (dayOfWeek: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return days[dayOfWeek] ?? "Unknown";
};

export default function WorkerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const workerId = params.workerId as string;

  const [worker, setWorker] = useState<PublicWorker | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWorker = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicWorkerById(workerId);

        setWorker(data);
      } catch (err) {
        console.error("Failed to load worker:", err);
        setError(
          "Failed to load worker details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (workerId) {
      loadWorker();
    }
  }, [workerId]);

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.messageBox}>
            <p style={styles.messageText}>
              Loading worker details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !worker) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <button
            type="button"
            onClick={() => router.push("/workers")}
            style={styles.backButton}
          >
            <ArrowLeft size={18} />
            Back to Workers
          </button>

          <div style={styles.messageBox}>
            <p style={styles.errorText}>
              {error || "Worker not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const profileImage = getImageUrl(
    worker.user.profileImage,
  );

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/workers")}
          style={styles.backButton}
        >
          <ArrowLeft size={18} />
          Back to Workers
        </button>

        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.profileArea}>
            <div style={styles.avatar}>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={worker.user.fullName}
                  style={styles.avatarImage}
                />
              ) : (
                worker.user.fullName
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div>
              <div style={styles.nameRow}>
                <h1 style={styles.name}>
                  {worker.user.fullName}
                </h1>

                <span style={styles.verifiedBadge}>
                  <CheckCircle2 size={15} />
                  Verified
                </span>
              </div>

              <p style={styles.role}>
                {worker.services.length > 0
                  ? worker.services[0].category.name
                  : "Service Worker"}
              </p>

              <div style={styles.ratingRow}>
                <Star
                  size={18}
                  fill="currentColor"
                  color="#f59e0b"
                />

                <strong style={styles.rating}>
                  {worker.averageRating.toFixed(1)}
                </strong>

                <span style={styles.reviewText}>
                  ({worker.totalReviews} reviews)
                </span>
              </div>
            </div>
          </div>

          <div style={styles.availableBadge}>
            <span style={styles.availableDot} />
            Available
          </div>
        </section>

        {/* Main Grid */}
        <div style={styles.mainGrid}>
          {/* Left */}
          <div style={styles.leftColumn}>
            {/* About */}
            <section style={styles.card}>
              <div style={styles.sectionTitleRow}>
                <BriefcaseBusiness size={19} />
                <h2 style={styles.sectionTitle}>
                  About Worker
                </h2>
              </div>

              <p style={styles.bio}>
                {worker.bio ||
                  "This worker has not added a biography yet."}
              </p>

              <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                  <strong style={styles.statValue}>
                    {worker.experienceYears}
                  </strong>

                  <span style={styles.statLabel}>
                    Years Experience
                  </span>
                </div>

                <div style={styles.statBox}>
                  <strong style={styles.statValue}>
                    {worker.completedJobs}
                  </strong>

                  <span style={styles.statLabel}>
                    Completed Jobs
                  </span>
                </div>

                <div style={styles.statBox}>
                  <strong style={styles.statValue}>
                    {worker.totalReviews}
                  </strong>

                  <span style={styles.statLabel}>
                    Reviews
                  </span>
                </div>
              </div>
            </section>

            {/* Services */}
            <section style={styles.card}>
              <div style={styles.sectionTitleRow}>
                <BriefcaseBusiness size={19} />
                <h2 style={styles.sectionTitle}>
                  Services
                </h2>
              </div>

              {worker.services.length === 0 ? (
                <p style={styles.emptyText}>
                  No services available.
                </p>
              ) : (
                <div style={styles.serviceList}>
                  {worker.services.map((service) => (
                    <div
                      key={service.id}
                      style={styles.serviceCard}
                    >
                      <div>
                        <h3 style={styles.serviceName}>
                          {service.category.name}
                        </h3>

                        <p style={styles.serviceDescription}>
                          {service.serviceDescription ||
                            "Professional service available."}
                        </p>

                        <span style={styles.serviceExperience}>
                          {service.experienceYears} years
                          experience
                        </span>
                      </div>

                      <div style={styles.servicePrice}>
                        Rs.{" "}
                        {Number(
                          service.servicePrice,
                        ).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Skills */}
            <section style={styles.card}>
              <div style={styles.sectionTitleRow}>
                <CheckCircle2 size={19} />
                <h2 style={styles.sectionTitle}>
                  Skills
                </h2>
              </div>

              {worker.skills.length === 0 ? (
                <p style={styles.emptyText}>
                  No skills added.
                </p>
              ) : (
                <div style={styles.skills}>
                  {worker.skills.map((item) => (
                    <span
                      key={item.id}
                      style={styles.skillTag}
                    >
                      {item.skill.name}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Gallery */}
            <section style={styles.card}>
              <div style={styles.sectionTitleRow}>
                <ImageIcon size={19} />
                <h2 style={styles.sectionTitle}>
                  Work Gallery
                </h2>
              </div>

              {worker.gallery.length === 0 ? (
                <p style={styles.emptyText}>
                  No gallery images available.
                </p>
              ) : (
                <div style={styles.galleryGrid}>
                  {worker.gallery.map((image) => (
                    <div
                      key={image.id}
                      style={styles.galleryItem}
                    >
                      <img
                        src={getImageUrl(image.imageUrl)}
                        alt={image.title || "Worker work"}
                        style={styles.galleryImage}
                      />

                      <div style={styles.galleryInfo}>
                        <strong>
                          {image.title ||
                            "Completed Work"}
                        </strong>

                        {image.description && (
                          <span>
                            {image.description}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right */}
          <aside style={styles.rightColumn}>
            {/* Contact */}
            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Contact
              </h2>

              {worker.user.phone ? (
                <div style={styles.contactRow}>
                  <div style={styles.contactIcon}>
                    <Phone size={17} />
                  </div>

                  <div>
                    <span style={styles.contactLabel}>
                      Phone
                    </span>

                    <strong style={styles.contactValue}>
                      {worker.user.phone}
                    </strong>
                  </div>
                </div>
              ) : (
                <p style={styles.emptyText}>
                  Phone number not available.
                </p>
              )}
            </section>

            {/* Availability */}
            <section style={styles.card}>
              <div style={styles.sectionTitleRow}>
                <CalendarDays size={19} />
                <h2 style={styles.sectionTitle}>
                  Availability
                </h2>
              </div>

              {worker.availability.length === 0 ? (
                <p style={styles.emptyText}>
                  Availability not added.
                </p>
              ) : (
                <div style={styles.availabilityList}>
                  {worker.availability.map((item) => (
                    <div
                      key={item.id}
                      style={styles.availabilityRow}
                    >
                      <span style={styles.day}>
                        {getDayName(item.dayOfWeek)}
                      </span>

                      <span style={styles.time}>
                        {item.startTime} -{" "}
                        {item.endTime}
                      </span>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(item.status ===
                          "AVAILABLE"
                            ? styles.availableStatus
                            : styles.otherStatus),
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Booking CTA */}
            <section style={styles.bookingCard}>
              <h2 style={styles.bookingTitle}>
                Need this service?
              </h2>

              <p style={styles.bookingText}>
                You can book this worker for your
                service requirement.
              </p>

              <button
                type="button"
                style={styles.bookingButton}
                onClick={() => {
                  alert(
                    "Booking feature will be added in the next step.",
                  );
                }}
              >
                Book This Worker
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "35px 24px 60px",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    background: "transparent",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    padding: "8px 0",
    marginBottom: "20px",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "25px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    marginBottom: "22px",
    boxShadow:
      "0 4px 14px rgba(15, 23, 42, 0.05)",
  },

  profileArea: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    overflow: "hidden",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: 800,
    flexShrink: 0,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center top",
  },

  nameRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },

  name: {
    margin: 0,
    fontSize: "30px",
    color: "#0f172a",
  },

  verifiedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#15803d",
    fontSize: "11px",
    fontWeight: 700,
  },

  role: {
    margin: "6px 0",
    color: "#2563eb",
    fontSize: "15px",
    fontWeight: 600,
  },

  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "8px",
  },

  rating: {
    color: "#334155",
  },

  reviewText: {
    color: "#94a3b8",
    fontSize: "13px",
  },

  availableBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 13px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#15803d",
    fontSize: "13px",
    fontWeight: 700,
  },

  availableDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) 350px",
    gap: "22px",
    alignItems: "start",
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "22px",
    boxShadow:
      "0 3px 12px rgba(15, 23, 42, 0.04)",
  },

  sectionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#2563eb",
    marginBottom: "16px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 750,
    color: "#0f172a",
  },

  bio: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#64748b",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "20px",
  },

  statBox: {
    padding: "15px",
    borderRadius: "10px",
    background: "#f8fafc",
    textAlign: "center",
  },

  statValue: {
    display: "block",
    fontSize: "22px",
    color: "#0f172a",
  },

  statLabel: {
    display: "block",
    marginTop: "4px",
    fontSize: "11px",
    color: "#64748b",
  },

  serviceList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  serviceCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "15px",
    border: "1px solid #e2e8f0",
    borderRadius: "11px",
  },

  serviceName: {
    margin: 0,
    fontSize: "15px",
    color: "#0f172a",
  },

  serviceDescription: {
    margin: "5px 0",
    fontSize: "13px",
    color: "#64748b",
  },

  serviceExperience: {
    fontSize: "12px",
    color: "#94a3b8",
  },

  servicePrice: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#0f172a",
    whiteSpace: "nowrap",
  },

  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  skillTag: {
    padding: "7px 10px",
    borderRadius: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 600,
  },

  galleryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "14px",
  },

  galleryItem: {
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    borderRadius: "11px",
    background: "#ffffff",
  },

  galleryImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    display: "block",
  },

  galleryInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "10px",
  },

  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  contactIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  contactLabel: {
    display: "block",
    fontSize: "11px",
    color: "#94a3b8",
  },

  contactValue: {
    display: "block",
    marginTop: "2px",
    fontSize: "14px",
    color: "#0f172a",
  },

  availabilityList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  availabilityRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "5px 10px",
    padding: "10px",
    borderRadius: "9px",
    background: "#f8fafc",
  },

  day: {
    fontSize: "13px",
    fontWeight: 650,
    color: "#334155",
  },

  time: {
    fontSize: "12px",
    color: "#64748b",
  },

  statusBadge: {
    gridColumn: "1 / -1",
    width: "fit-content",
    padding: "4px 7px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
  },

  availableStatus: {
    background: "#dcfce7",
    color: "#15803d",
  },

  otherStatus: {
    background: "#fef3c7",
    color: "#92400e",
  },

  bookingCard: {
    padding: "22px",
    borderRadius: "16px",
    background: "#2563eb",
    color: "#ffffff",
    boxShadow:
      "0 6px 18px rgba(37, 99, 235, 0.2)",
  },

  bookingTitle: {
    margin: 0,
    fontSize: "19px",
  },

  bookingText: {
    margin: "8px 0 18px",
    fontSize: "13px",
    lineHeight: 1.5,
    opacity: 0.9,
  },

  bookingButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: 750,
    cursor: "pointer",
  },

  emptyText: {
    margin: 0,
    fontSize: "13px",
    color: "#94a3b8",
  },

  messageBox: {
    minHeight: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
  },

  messageText: {
    color: "#64748b",
    fontSize: "14px",
  },

  errorText: {
    color: "#dc2626",
    fontSize: "14px",
  },
};