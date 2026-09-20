"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Star,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getPublicWorkers,
  PublicWorker,
} from "@/services/worker.service";

const getProfileImageUrl = (
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

export default function WorkersPage() {
  const [workers, setWorkers] = useState<PublicWorker[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicWorkers();
        setWorkers(data);
      } catch (err) {
        console.error("Failed to load workers:", err);
        setError("Failed to load workers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkers();
  }, []);

  const filteredWorkers = workers.filter((worker) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    const workerName = worker.user.fullName.toLowerCase();

    const services = worker.services
      .map((service) => service.category.name)
      .join(" ")
      .toLowerCase();

    const skills = worker.skills
      .map((item) => item.skill.name)
      .join(" ")
      .toLowerCase();

    return (
      workerName.includes(searchText) ||
      services.includes(searchText) ||
      skills.includes(searchText)
    );
  });

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <section style={styles.headerSection}>
          <div>
            <p style={styles.eyebrow}>FINDMEPRO SERVICES</p>

            <h1 style={styles.title}>Find Trusted Workers</h1>

            <p style={styles.subtitle}>
              Find skilled and verified service workers near you.
            </p>
          </div>

          <div style={styles.workerCount}>
            <BriefcaseBusiness size={20} />
            <span>
              {workers.length}{" "}
              {workers.length === 1 ? "Worker" : "Workers"}
            </span>
          </div>
        </section>

        {/* Search */}
        <section style={styles.searchSection}>
          <div style={styles.searchBox}>
            <Search size={21} color="#64748b" />

            <input
              type="text"
              placeholder="Search by worker, service or skill..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={styles.searchInput}
            />
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div style={styles.messageBox}>
            <p style={styles.messageText}>Loading workers...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {/* No workers */}
        {!loading && !error && filteredWorkers.length === 0 && (
          <div style={styles.messageBox}>
            <Search size={36} color="#94a3b8" />

            <h3 style={styles.emptyTitle}>No workers found</h3>

            <p style={styles.emptyText}>
              Try searching for another worker, service or skill.
            </p>
          </div>
        )}

        {/* Worker Grid */}
        {!loading && !error && filteredWorkers.length > 0 && (
          <section style={styles.grid}>
            {filteredWorkers.map((worker) => {
              const profileImage = getProfileImageUrl(
                worker.user.profileImage,
              );

              const primaryService =
                worker.services.length > 0
                  ? worker.services[0]
                  : null;

              return (
                <article key={worker.id} style={styles.card}>
                  {/* Card Header */}
                  <div style={styles.cardTop}>
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
                        <h2 style={styles.workerName}>
                          {worker.user.fullName}
                        </h2>

                        <div style={styles.ratingRow}>
                          <Star
                            size={16}
                            fill="currentColor"
                            color="#f59e0b"
                          />

                          <span style={styles.rating}>
                            {worker.averageRating.toFixed(1)}
                          </span>

                          <span style={styles.reviewCount}>
                            ({worker.totalReviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <span style={styles.availableBadge}>
                      Available
                    </span>
                  </div>

                  {/* Bio */}
                  <p style={styles.bio}>
                    {worker.bio ||
                      "Professional service worker available for your needs."}
                  </p>

                  {/* Service */}
                  {primaryService && (
                    <div style={styles.serviceBox}>
                      <div style={styles.serviceIcon}>
                        <BriefcaseBusiness size={18} />
                      </div>

                      <div style={styles.serviceInfo}>
                        <span style={styles.serviceLabel}>
                          Service
                        </span>

                        <strong style={styles.serviceName}>
                          {primaryService.category.name}
                        </strong>
                      </div>

                      <div style={styles.price}>
                        Rs.{" "}
                        {Number(
                          primaryService.servicePrice,
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div style={styles.details}>
                    <div style={styles.detailItem}>
                      <Clock3 size={17} />

                      <span>
                        {worker.experienceYears} years experience
                      </span>
                    </div>

                    {worker.services.length > 1 && (
                      <div style={styles.detailItem}>
                        <BriefcaseBusiness size={17} />

                        <span>
                          {worker.services.length} services
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {worker.skills.length > 0 && (
                    <div style={styles.skillsSection}>
                      <span style={styles.skillsLabel}>Skills</span>

                      <div style={styles.skills}>
                        {worker.skills.slice(0, 4).map((item) => (
                          <span
                            key={item.id}
                            style={styles.skillTag}
                          >
                            {item.skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <button
                    type="button"
                    style={styles.viewButton}
                    onClick={() => {
                      router.push(`/workers/${worker.id}`);
                    }}
                  >
                    <span>View Profile</span>
                    <ArrowRight size={18} />
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "40px 24px 60px",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "24px",
    marginBottom: "28px",
  },

  eyebrow: {
    margin: "0 0 8px",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1.5px",
    color: "#2563eb",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#0f172a",
  },

  subtitle: {
    margin: "10px 0 0",
    fontSize: "16px",
    color: "#64748b",
  },

  workerCount: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 16px",
    borderRadius: "10px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  searchSection: {
    marginBottom: "30px",
  },

  searchBox: {
    maxWidth: "620px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 16px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "15px",
    color: "#0f172a",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(330px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  profileArea: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    minWidth: 0,
  },

 avatar: {
  width: "68px",
  height: "68px",
  borderRadius: "50%",
  background: "#dbeafe",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "23px",
  fontWeight: 800,
  flexShrink: 0,
  overflow: "hidden",
},

avatarImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center top",
},

  workerName: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 700,
    color: "#0f172a",
  },

  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "6px",
  },

  rating: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#334155",
  },

  reviewCount: {
    fontSize: "12px",
    color: "#94a3b8",
  },

  availableBadge: {
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#15803d",
    fontSize: "11px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  bio: {
    margin: "18px 0",
    minHeight: "44px",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#64748b",
  },

  serviceBox: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "12px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #f1f5f9",
  },

  serviceIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  serviceInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },

  serviceLabel: {
    fontSize: "11px",
    color: "#94a3b8",
  },

  serviceName: {
    fontSize: "14px",
    color: "#1e293b",
  },

  price: {
    marginLeft: "auto",
    fontSize: "14px",
    fontWeight: 800,
    color: "#0f172a",
    whiteSpace: "nowrap",
  },

  details: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    marginTop: "16px",
  },

  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#64748b",
  },

  skillsSection: {
    marginTop: "17px",
  },

  skillsLabel: {
    display: "block",
    marginBottom: "8px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#475569",
  },

  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },

  skillTag: {
    padding: "5px 9px",
    borderRadius: "7px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 600,
  },

  viewButton: {
    width: "100%",
    marginTop: "20px",
    padding: "11px 14px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },

  messageBox: {
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
  },

  messageText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  emptyTitle: {
    margin: "5px 0 0",
    fontSize: "18px",
    color: "#334155",
  },

  emptyText: {
    margin: 0,
    fontSize: "14px",
    color: "#94a3b8",
  },

  errorBox: {
    padding: "20px",
    borderRadius: "12px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
  },

  errorText: {
    margin: 0,
    color: "#dc2626",
    fontSize: "14px",
  },
};