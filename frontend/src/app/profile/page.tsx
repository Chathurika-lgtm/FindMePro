"use client";

import { useEffect, useState } from "react";

import {
  getProfile,
  updateProfile,
  uploadProfileImage,
} from "@/services/auth.service";

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
  updatedAt?: string;
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
  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editMode, setEditMode] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  // =========================
  // ACCOUNT INFORMATION
  // =========================

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [gender, setGender] =
    useState<string>("");

  const [profileImage, setProfileImage] =
    useState("");

  const [profileImageFile, setProfileImageFile] =
    useState<File | null>(null);

  const [profileImagePreview, setProfileImagePreview] =
    useState("");

  // =========================
  // CUSTOMER INFORMATION
  // =========================

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [postalCode, setPostalCode] =
    useState("");

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  // =========================
  // IMAGE URL
  // =========================

  const getProfileImageUrl = (
    imagePath: string | null | undefined,
  ) => {
    if (!imagePath) {
      return "";
    }

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      return imagePath;
    }

    return `${apiUrl}${imagePath}`;
  };

  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const userData =
          await getProfile();

        console.log(
          "Profile data:",
          userData,
        );

        const currentUser =
          userData.user ?? userData;

        setUser(currentUser);

        setFullName(
          currentUser.fullName ?? "",
        );

        setEmail(
          currentUser.email ?? "",
        );

        setPhone(
          currentUser.phone ?? "",
        );

        setGender(
          currentUser.gender ?? "",
        );

        setProfileImage(
          currentUser.profileImage ?? "",
        );

        // =========================
        // CUSTOMER PROFILE
        // =========================

        if (
          currentUser.role ===
          "CUSTOMER"
        ) {
          try {
            const customerData =
              await getCustomerProfile();

            console.log(
              "Customer profile data:",
              customerData,
            );

            setCustomerProfile(
              customerData,
            );

            setAddress(
              customerData.address ?? "",
            );

            setCity(
              customerData.city ?? "",
            );

            setDistrict(
              customerData.district ?? "",
            );

            setPostalCode(
              customerData.postalCode ?? "",
            );

            setLatitude(
              customerData.latitude !==
                null &&
              customerData.latitude !==
                undefined
                ? String(
                    customerData.latitude,
                  )
                : "",
            );

            setLongitude(
              customerData.longitude !==
                null &&
              customerData.longitude !==
                undefined
                ? String(
                    customerData.longitude,
                  )
                : "",
            );
          } catch (customerError) {
            console.log(
              "Customer profile not available:",
              customerError,
            );
          }
        }
      } catch (err) {
        console.error(
          "Profile loading error:",
          err,
        );

        setError(
          "Unable to load profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // =========================
  // IMAGE PREVIEW
  // =========================

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview("");
      return;
    }

    const previewUrl =
      URL.createObjectURL(
        profileImageFile,
      );

    setProfileImagePreview(
      previewUrl,
    );

    return () => {
      URL.revokeObjectURL(
        previewUrl,
      );
    };
  }, [profileImageFile]);

  // =========================
  // EDIT PROFILE
  // =========================

  const handleEditProfile = () => {
    setSuccess("");
    setError("");
    setProfileImageFile(null);
    setProfileImagePreview("");
    setEditMode(true);
  };

  // =========================
  // CANCEL
  // =========================

  const handleCancel = () => {
    if (user) {
      setFullName(
        user.fullName ?? "",
      );

      setEmail(
        user.email ?? "",
      );

      setPhone(
        user.phone ?? "",
      );

      setGender(
        user.gender ?? "",
      );

      setProfileImage(
        user.profileImage ?? "",
      );
    }

    if (customerProfile) {
      setAddress(
        customerProfile.address ?? "",
      );

      setCity(
        customerProfile.city ?? "",
      );

      setDistrict(
        customerProfile.district ?? "",
      );

      setPostalCode(
        customerProfile.postalCode ?? "",
      );

      setLatitude(
        customerProfile.latitude !==
          null &&
        customerProfile.latitude !==
          undefined
          ? String(
              customerProfile.latitude,
            )
          : "",
      );

      setLongitude(
        customerProfile.longitude !==
          null &&
        customerProfile.longitude !==
          undefined
          ? String(
              customerProfile.longitude,
            )
          : "",
      );
    }

    setProfileImageFile(null);
    setProfileImagePreview("");

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

      // =========================
      // 1. UPLOAD IMAGE
      // =========================

      let finalProfileImage =
        profileImage;

      if (profileImageFile) {
        console.log(
          "Uploading profile image:",
          profileImageFile.name,
        );

        const imageResponse =
          await uploadProfileImage(
            profileImageFile,
          );

        console.log(
          "Profile image uploaded:",
          imageResponse,
        );

        finalProfileImage =
          imageResponse?.user
            ?.profileImage ?? "";

        setProfileImage(
          finalProfileImage,
        );

        setProfileImageFile(null);
        setProfileImagePreview("");
      }

      // =========================
      // 2. UPDATE ACCOUNT
      // =========================

      const accountData = {
  fullName: fullName.trim() || undefined,

  email: email.trim() || undefined,

  phone: phone.trim() || undefined,

  gender:
    gender === "MALE" || gender === "FEMALE"
      ? (gender as "MALE" | "FEMALE")
      : undefined,
};

console.log(
  "Updating account profile:",
  accountData,
);

const updatedUserResponse =
  await updateProfile(accountData);

console.log(
  "Account profile updated:",
  updatedUserResponse,
);

const updatedUser: UserProfile = {
  ...updatedUserResponse.user,

  profileImage:
    finalProfileImage ||
    updatedUserResponse.user?.profileImage ||
    "",
};

setUser(updatedUser);

setFullName(
  updatedUser.fullName ?? "",
);

setEmail(
  updatedUser.email ?? "",
);

setPhone(
  updatedUser.phone ?? "",
);

setGender(
  updatedUser.gender ?? "",
);

setProfileImage(
  updatedUser.profileImage ?? "",
);

      // =========================
      // 3. UPDATE CUSTOMER
      // =========================

      if (
        updatedUser.role ===
        "CUSTOMER"
      ) {
        const data = {
          address:
            address.trim() ||
            undefined,

          city:
            city.trim() ||
            undefined,

          district:
            district.trim() ||
            undefined,

          postalCode:
            postalCode.trim() ||
            undefined,

          latitude:
            latitude.trim() !== ""
              ? Number(latitude)
              : undefined,

          longitude:
            longitude.trim() !== ""
              ? Number(longitude)
              : undefined,
        };

        console.log(
          "Updating customer profile:",
          data,
        );

        const updatedProfile =
          await updateCustomerProfile(
            data,
          );

        console.log(
          "Customer profile updated:",
          updatedProfile,
        );

        setCustomerProfile(
          updatedProfile,
        );

        setAddress(
          updatedProfile.address ??
            "",
        );

        setCity(
          updatedProfile.city ??
            "",
        );

        setDistrict(
          updatedProfile.district ??
            "",
        );

        setPostalCode(
          updatedProfile.postalCode ??
            "",
        );

        setLatitude(
          updatedProfile.latitude !==
              null &&
            updatedProfile.latitude !==
              undefined
            ? String(
                updatedProfile.latitude,
              )
            : "",
        );

        setLongitude(
          updatedProfile.longitude !==
              null &&
            updatedProfile.longitude !==
              undefined
            ? String(
                updatedProfile.longitude,
              )
            : "",
        );
      }

      // =========================
      // 4. SUCCESS
      // =========================

      setSuccess(
        "Profile updated successfully.",
      );

      setEditMode(false);
    } catch (err: any) {
      console.error(
        "Profile update error:",
        err,
      );

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
        <p>
          Loading profile...
        </p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !user) {
    return (
      <div style={styles.center}>
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      </div>
    );
  }

  // =========================
  // NO USER
  // =========================

  if (!user) {
    return (
      <div style={styles.center}>
        <p>
          No profile data found.
        </p>
      </div>
    );
  }

  // =========================
  // IMAGE URL
  // =========================

  const currentImageUrl =
    getProfileImageUrl(
      user.profileImage,
    );

  const previewImageUrl =
    profileImagePreview ||
    currentImageUrl;

  // =========================
  // PAGE
  // =========================

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* HEADER */}

        <div style={styles.header}>
          <div style={styles.avatar}>
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt="Profile"
                style={
                  styles.avatarImage
                }
              />
            ) : (
              user.fullName
                ?.charAt(0)
                .toUpperCase()
            )}
          </div>

          <div>
            <h1
              style={styles.title}
            >
              {user.fullName}
            </h1>

            <p
              style={styles.email}
            >
              {user.email}
            </p>
          </div>
        </div>

        <div
          style={styles.divider}
        />

        {/* SUCCESS */}

        {success && (
          <div
            style={
              styles.successBox
            }
          >
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            style={styles.errorBox}
          >
            {error}
          </div>
        )}

        {/* ACCOUNT INFORMATION */}

        <h2
          style={
            styles.sectionTitle
          }
        >
          Account Information
        </h2>

        {!editMode ? (
          <div
            style={styles.grid}
          >
            <ProfileItem
              label="Full Name"
              value={
                user.fullName
              }
            />

            <ProfileItem
              label="Email"
              value={
                user.email
              }
            />

            <ProfileItem
              label="Phone"
              value={
                user.phone ||
                "Not added"
              }
            />

            <ProfileItem
              label="Gender"
              value={
                user.gender ||
                "Not added"
              }
            />

            <ProfileItem
              label="Role"
              value={
                user.role
              }
            />

            <ProfileItem
              label="Status"
              value={
                user.status
              }
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
        ) : (
          <div
            style={styles.form}
          >
            <InputField
              label="Full Name"
              value={fullName}
              onChange={
                setFullName
              }
              placeholder="Enter your full name"
            />

            <InputField
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
            />

            <InputField
              label="Phone"
              value={phone}
              onChange={setPhone}
              placeholder="Enter your phone number"
            />

            {/* GENDER */}

            <div
              style={
                styles.inputContainer
              }
            >
              <label
                style={
                  styles.inputLabel
                }
              >
                Gender
              </label>

              <select
                value={gender}
                onChange={(
                  event,
                ) => {
                  setGender(
                    event.target.value,
                  );
                }}
                style={styles.input}
              >
                <option value="">
                  Select Gender
                </option>

                <option value="MALE">
                  Male
                </option>

                <option value="FEMALE">
                  Female
                </option>
              </select>
            </div>

            {/* PROFILE IMAGE */}

            <div
              style={
                styles.inputContainer
              }
            >
              <label
                style={
                  styles.inputLabel
                }
              >
                Profile Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(
                  event,
                ) => {
                  const file =
                    event.target
                      .files?.[0] ??
                    null;

                  if (!file) {
                    return;
                  }

                  if (
                    !file.type.startsWith(
                      "image/",
                    )
                  ) {
                    setError(
                      "Please select a valid image file.",
                    );

                    return;
                  }

                  setError("");

                  setProfileImageFile(
                    file,
                  );
                }}
                style={styles.input}
              />

              {/* PREVIEW */}

              {previewImageUrl && (
                <div
                  style={
                    styles.previewContainer
                  }
                >
                  <img
                    src={
                      previewImageUrl
                    }
                    alt="Profile preview"
                    style={
                      styles.previewImage
                    }
                  />

                  <div>
                    <p
                      style={
                        styles.previewTitle
                      }
                    >
                      Image Preview
                    </p>

                    <p
                      style={
                        styles.previewText
                      }
                    >
                      {profileImageFile
                        ? "This image will be uploaded as your profile picture."
                        : "Current profile picture"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CUSTOMER INFORMATION */}

        {user.role ===
          "CUSTOMER" && (
          <>
            <div
              style={styles.divider}
            />

            <h2
              style={
                styles.sectionTitle
              }
            >
              Customer Information
            </h2>

            {!editMode ? (
              <div
                style={styles.grid}
              >
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
              <div
                style={styles.form}
              >
                <InputField
                  label="Address"
                  value={address}
                  onChange={
                    setAddress
                  }
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
                  onChange={
                    setDistrict
                  }
                  placeholder="Enter your district"
                />

                <InputField
                  label="Postal Code"
                  value={postalCode}
                  onChange={
                    setPostalCode
                  }
                  placeholder="Enter 5 digit postal code"
                />

                <InputField
                  label="Latitude"
                  value={latitude}
                  onChange={
                    setLatitude
                  }
                  placeholder="Example: 6.927079"
                  type="number"
                />

                <InputField
                  label="Longitude"
                  value={longitude}
                  onChange={
                    setLongitude
                  }
                  placeholder="Example: 79.861244"
                  type="number"
                />
              </div>
            )}
          </>
        )}

        {/* BUTTONS */}

        <div
          style={
            styles.buttonContainer
          }
        >
          {!editMode ? (
            <button
              type="button"
              onClick={
                handleEditProfile
              }
              style={
                styles.editButton
              }
            >
              Edit Profile
            </button>
          ) : (
            <div
              style={
                styles.buttonGroup
              }
            >
              <button
                type="button"
                onClick={
                  handleCancel
                }
                disabled={saving}
                style={
                  styles.cancelButton
                }
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={saving}
                style={
                  styles.saveButton
                }
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
      <p
        style={styles.label}
      >
        {label}
      </p>

      <p
        style={styles.value}
      >
        {value}
      </p>
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
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div
      style={
        styles.inputContainer
      }
    >
      <label
        style={
          styles.inputLabel
        }
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
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
    overflow: "hidden",
    flexShrink: 0,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover" as const,
    display: "block",
    objectPosition: "center top",
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
    gridTemplateColumns:
      "1fr 1fr",
    gap: "20px",
  },

  item: {
    padding: "18px",
    background: "#f8fafc",
    borderRadius: "10px",
    border:
      "1px solid #e5e7eb",
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
    gridTemplateColumns:
      "1fr 1fr",
    gap: "20px",
  },

  inputContainer: {
    display: "flex",
    flexDirection:
      "column" as const,
    gap: "8px",
  },

  inputLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing:
      "border-box" as const,
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    padding:
      "12px 14px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    background: "#ffffff",
  },

  previewContainer: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginTop: "10px",
    padding: "12px",
    background: "#f8fafc",
    border:
      "1px solid #e5e7eb",
    borderRadius: "10px",
  },

  previewImage: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    objectFit:
      "cover" as const,
    border:
      "2px solid #e5e7eb",
  },

  previewTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },

  previewText: {
    marginTop: "5px",
    marginBottom: 0,
    fontSize: "13px",
    color: "#64748b",
  },

  buttonContainer: {
    marginTop: "30px",
    display: "flex",
    justifyContent:
      "flex-end",
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
    padding:
      "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  saveButton: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding:
      "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  cancelButton: {
    background: "#6b7280",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding:
      "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  successBox: {
    background: "#ecfdf5",
    border:
      "1px solid #86efac",
    color: "#166534",
    padding:
      "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  errorBox: {
    background: "#fef2f2",
    border:
      "1px solid #fecaca",
    color: "#dc2626",
    padding:
      "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
};