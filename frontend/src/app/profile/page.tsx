"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/services/auth.service";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "@/services/customer.service";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "WORKER" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE";
  gender?: string | null;
  profileImage?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
}

interface CustomerProfile {
  id: string;
  userId: string;
  address: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);

  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        // Main user profile
        const userData = await getProfile();

        console.log("Profile data:", userData);

        setUser(userData.user ?? userData);

        // Customer profile
        try {
          const customerData = await getCustomerProfile();

          console.log(
            "Customer profile data:",
            customerData,
          );

          setCustomerProfile(customerData);

          setAddress(customerData.address ?? "");
          setCity(customerData.city ?? "");
          setDistrict(customerData.district ?? "");
          setPostalCode(customerData.postalCode ?? "");

          setLatitude(
            customerData.latitude !== null &&
              customerData.latitude !== undefined
              ? String(customerData.latitude)
              : "",
          );

          setLongitude(
            customerData.longitude !== null &&
              customerData.longitude !== undefined
              ? String(customerData.longitude)
              : "",
          );
        } catch (customerError) {
          console.log(
            "Customer profile not available:",
            customerError,
          );
        }
      } catch (err) {
        console.error("Profile loading error:", err);

        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // =========================
  // EDIT PROFILE
  // =========================

  const handleEditProfile = () => {
    setSuccess("");
    setError("");
    setEditMode(true);
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancel = () => {
    if (customerProfile) {
      setAddress(customerProfile.address ?? "");
      setCity(customerProfile.city ?? "");
      setDistrict(customerProfile.district ?? "");
      setPostalCode(customerProfile.postalCode ?? "");

      setLatitude(
        customerProfile.latitude !== null &&
          customerProfile.latitude !== undefined
          ? String(customerProfile.latitude)
          : "",
      );

      setLongitude(
        customerProfile.longitude !== null &&
          customerProfile.longitude !== undefined
          ? String(customerProfile.longitude)
          : "",
      );
    }

    setError("");
    setSuccess("");
    setEditMode(false);
  };

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = {
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        latitude:
          latitude.trim() !== ""
            ? Number(latitude)
            : undefined,
        longitude:
          longitude.trim() !== ""
            ? Number(longitude)
            : undefined,
      };

      console.log("Updating customer profile:", data);

      const updatedProfile =
        await updateCustomerProfile(data);

      console.log(
        "Customer profile updated:",
        updatedProfile,
      );

      setCustomerProfile(updatedProfile);

      setAddress(updatedProfile.address ?? "");
      setCity(updatedProfile.city ?? "");
      setDistrict(updatedProfile.district ?? "");
      setPostalCode(updatedProfile.postalCode ?? "");

      setLatitude(
        updatedProfile.latitude !== null &&
          updatedProfile.latitude !== undefined
          ? String(updatedProfile.latitude)
          : "",
      );

      setLongitude(
        updatedProfile.longitude !== null &&
          updatedProfile.longitude !== undefined
          ? String(updatedProfile.longitude)
          : "",
      );

      setSuccess("Profile updated successfully.");

      setEditMode(false);
    } catch (err: any) {
      console.error("Profile update error:", err);

      const message =
        err?.response?.data?.message ||
        "Unable to update profile.";

      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message,
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Loading profile...</p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !user) {
    return (
      <div style={styles.center}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  // =========================
  // NO USER
  // =========================

  if (!user) {
    return (
      <div style={styles.center}>
        <p>No profile data found.</p>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* HEADER */}

        <div style={styles.header}>
          <div style={styles.avatar}>
            {user.fullName
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h1 style={styles.title}>
              {user.fullName}
            </h1>

            <p style={styles.email}>
              {user.email}
            </p>
          </div>
        </div>

        <div style={styles.divider}></div>

        {/* SUCCESS */}

        {success && (
          <div style={styles.successBox}>
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* USER INFORMATION */}

        <h2 style={styles.sectionTitle}>
          Account Information
        </h2>

        <div style={styles.grid}>
          <ProfileItem
            label="Full Name"
            value={user.fullName}
          />

          <ProfileItem
            label="Email"
            value={user.email}
          />

          <ProfileItem
            label="Phone"
            value={user.phone || "Not added"}
          />

          <ProfileItem
            label="Gender"
            value={user.gender || "Not added"}
          />

          <ProfileItem
            label="Role"
            value={user.role}
          />

          <ProfileItem
            label="Status"
            value={user.status}
          />

          <ProfileItem
            label="Email Verified"
            value={
              user.emailVerified
                ? "Verified"
                : "Not Verified"
            }
          />

          <ProfileItem
            label="Phone Verified"
            value={
              user.phoneVerified
                ? "Verified"
                : "Not Verified"
            }
          />
        </div>

        {/* CUSTOMER PROFILE */}

        {user.role === "CUSTOMER" && (
          <>
            <div style={styles.divider}></div>

            <h2 style={styles.sectionTitle}>
              Customer Information
            </h2>

            {!editMode ? (
              <div style={styles.grid}>
                <ProfileItem
                  label="Address"
                  value={
                    customerProfile?.address ||
                    "Not added"
                  }
                />

                <ProfileItem
                  label="City"
                  value={
                    customerProfile?.city ||
                    "Not added"
                  }
                />

                <ProfileItem
                  label="District"
                  value={
                    customerProfile?.district ||
                    "Not added"
                  }
                />

                <ProfileItem
                  label="Postal Code"
                  value={
                    customerProfile?.postalCode ||
                    "Not added"
                  }
                />

                <ProfileItem
                  label="Latitude"
                  value={
                    customerProfile?.latitude !==
                    null &&
                    customerProfile?.latitude !==
                      undefined
                      ? String(
                          customerProfile.latitude,
                        )
                      : "Not added"
                  }
                />

                <ProfileItem
                  label="Longitude"
                  value={
                    customerProfile?.longitude !==
                    null &&
                    customerProfile?.longitude !==
                      undefined
                      ? String(
                          customerProfile.longitude,
                        )
                      : "Not added"
                  }
                />
              </div>
            ) : (
              <div style={styles.form}>
                <InputField
                  label="Address"
                  value={address}
                  onChange={setAddress}
                  placeholder="Enter your address"
                />

                <InputField
                  label="City"
                  value={city}
                  onChange={setCity}
                  placeholder="Enter your city"
                />

                <InputField
                  label="District"
                  value={district}
                  onChange={setDistrict}
                  placeholder="Enter your district"
                />

                <InputField
                  label="Postal Code"
                  value={postalCode}
                  onChange={setPostalCode}
                  placeholder="Enter 5 digit postal code"
                />

                <InputField
                  label="Latitude"
                  value={latitude}
                  onChange={setLatitude}
                  placeholder="Example: 6.927079"
                  type="number"
                />

                <InputField
                  label="Longitude"
                  value={longitude}
                  onChange={setLongitude}
                  placeholder="Example: 79.861244"
                  type="number"
                />
              </div>
            )}
          </>
        )}

        {/* BUTTONS */}

        <div style={styles.buttonContainer}>
          {!editMode ? (
            <button
              type="button"
              onClick={handleEditProfile}
              style={styles.editButton}
            >
              Edit Profile
            </button>
          ) : (
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={styles.saveButton}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================
// PROFILE ITEM
// =========================

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.item}>
      <p style={styles.label}>{label}</p>

      <p style={styles.value}>{value}</p>
    </div>
  );
}

// =========================
// INPUT FIELD
// =========================

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div style={styles.inputContainer}>
      <label style={styles.inputLabel}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

// =========================
// STYLES
// =========================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "40px 20px",
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f7fb",
  },

  card: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "35px",
    boxShadow:
      "0 8px 30px rgba(0, 0, 0, 0.08)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#1d4ed8",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "700",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#123b70",
  },

  email: {
    marginTop: "6px",
    color: "#64748b",
  },

  divider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "30px 0",
  },

  sectionTitle: {
    margin: "0 0 20px",
    fontSize: "20px",
    color: "#123b70",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  item: {
    padding: "18px",
    background: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
  },

  label: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
  },

  value: {
    marginTop: "8px",
    marginBottom: 0,
    fontSize: "16px",
    color: "#111827",
    fontWeight: "500",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  inputContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },

  inputLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box" as const,
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    background: "#ffffff",
  },

  buttonContainer: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "flex-end",
  },

  buttonGroup: {
    display: "flex",
    gap: "12px",
  },

  editButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  saveButton: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  cancelButton: {
    background: "#6b7280",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  successBox: {
    background: "#ecfdf5",
    border: "1px solid #86efac",
    color: "#166534",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
};