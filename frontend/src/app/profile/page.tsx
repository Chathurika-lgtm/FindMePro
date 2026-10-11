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

import {

  getWorkerProfile,

  getWorkerCategories,

  getMyWorkerServices,

  type WorkerService,

  type WorkerServiceCategory,

} from "@/services/worker.service";

import api from "@/lib/axios";

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

interface AvailableSkill {
  id: string;
  name: string;
  description?: string | null;
}

interface WorkerGalleryItem {
  id: string;
  workerId: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  displayOrder: number;
  createdAt: string;
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

  // WORKER PROFESSIONAL INFORMATION

  // =========================

  const [workerBio, setWorkerBio] =

    useState("");

  const [workerExperienceYears, setWorkerExperienceYears] =

    useState("");

    // WORKER SERVICES

const [serviceCategories, setServiceCategories] = useState<

  WorkerServiceCategory[]

>([]);

const [workerServices, setWorkerServices] = useState<WorkerService[]>([]);

const [serviceCategoryId, setServiceCategoryId] = useState("");

const [servicePrice, setServicePrice] = useState("");

const [serviceDescription, setServiceDescription] = useState("");

const [serviceExperienceYears, setServiceExperienceYears] = useState("0");

const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

const [servicesLoading, setServicesLoading] = useState(false);

const [serviceSaving, setServiceSaving] = useState(false);

  // WORKER SKILLS AND GALLERY
  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsSaving, setSkillsSaving] = useState(false);
  const [workerGallery, setWorkerGallery] = useState<WorkerGalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryPreview, setGalleryPreview] = useState("");
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");


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

        // =========================

// WORKER PROFILE

// =========================

if (

  currentUser.role ===

  "WORKER"

) {

  try {

    const workerData =

      await getWorkerProfile();

    console.log(

      "Worker profile data:",

      workerData,

    );

    setWorkerBio(

      workerData.bio ?? "",

    );

    setWorkerExperienceYears(

      String(

        workerData.experienceYears ?? 0,

      ),

    );

    setServicesLoading(true);

    try {
      const [categories, services] = await Promise.all([
        getWorkerCategories(),
        getMyWorkerServices(),
      ]);

      setServiceCategories(categories);
      setWorkerServices(services);
    } catch (serviceError) {
      console.error("Failed to load worker services:", serviceError);
    } finally {
      setServicesLoading(false);
    }

    // Load skills and gallery for the signed-in worker.
    setSkillsLoading(true);
    setGalleryLoading(true);
    try {
      const [skillsResponse, galleryResponse] = await Promise.all([
        api.get<AvailableSkill[]>("/worker/skills/options"),
        api.get<WorkerGalleryItem[]>("/worker/gallery"),
      ]);
      setAvailableSkills(skillsResponse.data);
      setWorkerGallery(galleryResponse.data);
      // The profile endpoint may include skills; use them to preselect current skills.
      const currentSkills = Array.isArray(workerData.skills) ? workerData.skills : [];
      setSelectedSkillIds(currentSkills.map((item: any) => item.skill?.id ?? item.skillId ?? item.id).filter(Boolean));
    } catch (profileExtrasError) {
      console.error("Failed to load worker skills/gallery:", profileExtrasError);
    } finally {
      setSkillsLoading(false);
      setGalleryLoading(false);
    }

  } catch (workerError) {

    console.error(

      "Failed to load worker profile:",

      workerError,

    );

  }

}

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
      // 3B. UPDATE WORKER PROFILE
      // =========================

      if (updatedUser.role === "WORKER") {
        const workerProfileResponse = await api.put("/worker/profile", {
          bio: workerBio.trim() || undefined,
          experienceYears:
            workerExperienceYears.trim() !== ""
              ? Number(workerExperienceYears)
              : 0,
        });

        const updatedWorkerProfile =
          workerProfileResponse.data?.workerProfile ??
          workerProfileResponse.data;

        setWorkerBio(updatedWorkerProfile?.bio ?? workerBio);
        setWorkerExperienceYears(
          String(updatedWorkerProfile?.experienceYears ?? workerExperienceYears),
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
  // WORKER SERVICE MANAGEMENT
  // =========================

  const resetServiceForm = () => {
    setServiceCategoryId("");
    setServicePrice("");
    setServiceDescription("");
    setServiceExperienceYears("0");
    setEditingServiceId(null);
  };

  
const MAX_WORKER_SERVICES = 4;

const handleSaveService = async () => {
  if (!serviceCategoryId || !servicePrice.trim()) {
    setError("Please select a service and enter its price.");
    setSuccess("");
    return;
  }

  // Maximum 4 services
  if (
    !editingServiceId &&
    workerServices.filter((service) => service.isActive !== false).length >=
      MAX_WORKER_SERVICES
  ) {
    setError("You can add a maximum of 4 active services.");
    setSuccess("");
    return;
  }

  // Prevent adding the same category twice
  if (
    !editingServiceId &&
    workerServices.some(
      (service) =>
        service.category.id === serviceCategoryId &&
        service.isActive !== false,
    )
  ) {
    setError("You have already added this service category.");
    setSuccess("");
    return;
  }

  const price = Number(servicePrice);
  const experience = Number(serviceExperienceYears);

  if (!Number.isFinite(price) || price <= 0) {
    setError("Please enter a valid service price greater than zero.");
    setSuccess("");
    return;
  }

  if (!Number.isInteger(experience) || experience < 0) {
    setError("Experience must be a whole number of 0 or more.");
    setSuccess("");
    return;
  }

  try {
    setServiceSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      categoryId: serviceCategoryId,
      servicePrice: price,
      serviceDescription: serviceDescription.trim() || undefined,
      experienceYears: experience,
    };

    if (editingServiceId) {
      await api.put(`/worker/services/${editingServiceId}`, payload);
      setSuccess("Service updated successfully.");
    } else {
      await api.post("/worker/services", payload);
    }

    const services = await getMyWorkerServices();
    setWorkerServices(services);
    resetServiceForm();

    if (!editingServiceId) {
      setSuccess("Service added successfully.");
    }
  } catch (err: any) {
    const message = err?.response?.data?.message;

    setError(
      Array.isArray(message)
        ? message.join(", ")
        : message || "Unable to save service.",
    );
  } finally {
    setServiceSaving(false);
  }
};


  const handleEditService = (service: WorkerService) => {
    setEditingServiceId(service.id);
    setServiceCategoryId(service.category.id);
    setServicePrice(String(service.servicePrice));
    setServiceDescription(service.serviceDescription ?? "");
    setServiceExperienceYears(String(service.experienceYears));
    setError("");
    setSuccess("");
  };

  const handleDeactivateService = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to deactivate this service?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/worker/services/${serviceId}`);

      const services = await getMyWorkerServices();
      setWorkerServices(services);

      if (editingServiceId === serviceId) {
        resetServiceForm();
      }

      setSuccess("Service deactivated successfully.");
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Unable to deactivate service.",
      );
    }
  };

  // =========================
  // =========================
  // WORKER SKILLS AND GALLERY
  // =========================

  const handleSaveSkills = async () => {
    if (selectedSkillIds.length === 0) {
      setError("Please select at least one skill.");
      setSuccess("");
      return;
    }
    try {
      setSkillsSaving(true);
      setError("");
      setSuccess("");
      await api.put("/worker/skills", { skillIds: selectedSkillIds });
      setSuccess("Skills updated successfully.");
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(", ") : message || "Unable to update skills.");
    } finally {
      setSkillsSaving(false);
    }
  };

  const handleUploadGallery = async () => {
    if (!galleryFile) {
      setError("Please choose a photo to upload.");
      setSuccess("");
      return;
    }
    if (!galleryFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    const formData = new FormData();
    formData.append("image", galleryFile);
    if (galleryTitle.trim()) formData.append("title", galleryTitle.trim());
    if (galleryDescription.trim()) formData.append("description", galleryDescription.trim());
    try {
      setGalleryUploading(true);
      setError("");
      setSuccess("");
      await api.post("/worker/gallery", formData);
      const response = await api.get<WorkerGalleryItem[]>("/worker/gallery");
      setWorkerGallery(response.data);
      setGalleryFile(null);
      setGalleryPreview("");
      setGalleryTitle("");
      setGalleryDescription("");
      setSuccess("Work photo uploaded successfully.");
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(", ") : message || "Unable to upload photo.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleDeleteGalleryImage = async (galleryId: string) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      setError("");
      setSuccess("");
      await api.delete(`/worker/gallery/${galleryId}`);
      setWorkerGallery((current) => current.filter((item) => item.id !== galleryId));
      setSuccess("Gallery photo deleted successfully.");
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(", ") : message || "Unable to delete photo.");
    }
  };

  const getGalleryImageUrl = (imagePath: string) => {
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return imagePath;
    return `${apiUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

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

        {/* WORKER PROFESSIONAL INFORMATION */}

{user.role ===

  "WORKER" && (

  <>

    <div

      style={styles.divider}

    />

    <h2

      style={

        styles.sectionTitle

      }

    >

      Professional Information

    </h2>

    {!editMode ? (

      <div

        style={styles.grid}

      >

        <ProfileItem

          label="Professional Bio"

          value={

            workerBio ||

            "Not added"

          }

        />

        <ProfileItem

          label="Experience"

          value={

            workerExperienceYears

              ? `${workerExperienceYears} years`

              : "Not added"

          }

        />

      </div>

    ) : (

      <div

        style={styles.grid}

      >

        <InputField

          label="Professional Bio"

          value={workerBio}

          onChange={setWorkerBio}

          placeholder="Describe your professional experience and expertise"

        />

        <InputField

          label="Experience (Years)"

          type="number"

          value={workerExperienceYears}

          onChange={setWorkerExperienceYears}

          placeholder="Enter your experience in years"

        />

      </div>

    )}

  </>

)}

        {/* MY SKILLS */}
        {user.role === "WORKER" && (
          <>
            <div style={styles.divider} />
            <h2 style={styles.sectionTitle}>My Skills</h2>
            <p style={{ color: "#64748b", marginTop: "-10px", marginBottom: "20px" }}>
              Select the skills you have so customers can understand your expertise.
            </p>
            {skillsLoading ? <p>Loading skills...</p> : availableSkills.length === 0 ? (
              <p style={{ color: "#b45309" }}>No skills are available yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {availableSkills.map((skill) => (
                  <label key={skill.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "14px", border: "1px solid #e5e7eb", borderRadius: "10px", background: selectedSkillIds.includes(skill.id) ? "#eff6ff" : "#fff", cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedSkillIds.includes(skill.id)} onChange={(event) => setSelectedSkillIds((current) => event.target.checked ? [...current, skill.id] : current.filter((id) => id !== skill.id))} />
                    <span><strong>{skill.name}</strong>{skill.description && <span style={{ display: "block", marginTop: "4px", color: "#64748b", fontSize: "13px" }}>{skill.description}</span>}</span>
                  </label>
                ))}
              </div>
            )}
            <div style={{ ...styles.buttonGroup, marginTop: "18px" }}>
              <button type="button" onClick={handleSaveSkills} disabled={skillsSaving || skillsLoading || availableSkills.length === 0} style={styles.saveButton}>{skillsSaving ? "Saving..." : "Save Skills"}</button>
            </div>

            {/* WORK GALLERY */}
            <div style={styles.divider} />
            <h2 style={styles.sectionTitle}>Work Gallery</h2>
            <p style={{ color: "#64748b", marginTop: "-10px", marginBottom: "20px" }}>Upload photos of your completed work to help customers see your experience.</p>
            <div style={styles.form}>
              <div style={styles.inputContainer}>
                <label style={styles.inputLabel}>Work Photo</label>
                <input type="file" accept="image/*" style={styles.input} onChange={(event) => { const file = event.target.files?.[0] ?? null; if (file && !file.type.startsWith("image/")) { setError("Please select a valid image file."); return; } setGalleryFile(file); setGalleryPreview(file ? URL.createObjectURL(file) : ""); }} />
                {galleryPreview && <img src={galleryPreview} alt="Work photo preview" style={{ width: "180px", height: "140px", objectFit: "cover", borderRadius: "10px", marginTop: "8px" }} />}
              </div>
              <InputField label="Photo Title" value={galleryTitle} onChange={setGalleryTitle} placeholder="Example: House wiring completed" />
              <div style={styles.inputContainer}>
                <label style={styles.inputLabel}>Description</label>
                <textarea value={galleryDescription} onChange={(event) => setGalleryDescription(event.target.value)} placeholder="Describe the work shown in this photo" rows={3} style={{ ...styles.input, resize: "vertical", fontFamily: "inherit" }} />
              </div>
            </div>
            <div style={{ ...styles.buttonGroup, marginTop: "18px" }}>
              <button type="button" onClick={handleUploadGallery} disabled={galleryUploading || galleryLoading || !galleryFile} style={styles.saveButton}>{galleryUploading ? "Uploading..." : "Upload Work Photo"}</button>
            </div>
            <h3 style={{ color: "#123b70", marginTop: "28px" }}>Your Work Photos</h3>
            {galleryLoading ? <p>Loading gallery...</p> : workerGallery.length === 0 ? (
              <p style={{ color: "#64748b" }}>No work photos uploaded yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                {workerGallery.map((item) => (
                  <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", background: "#fff" }}>
                    <img src={getGalleryImageUrl(item.imageUrl)} alt={item.title || "Worker completed work"} style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "14px" }}>
                      <strong>{item.title || "Completed Work"}</strong>
                      <p style={{ color: "#64748b", fontSize: "14px", margin: "8px 0 12px" }}>{item.description || "No description added."}</p>
                      <button type="button" onClick={() => handleDeleteGalleryImage(item.id)} style={{ ...styles.cancelButton, background: "#dc2626", padding: "9px 14px" }}>Delete Photo</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* MY SERVICES */}

        {user.role === "WORKER" && (
          <>
            <div style={styles.divider} />

            <h2 style={styles.sectionTitle}>My Services</h2>

            <p style={{ color: "#64748b", marginTop: "-10px", marginBottom: "20px" }}>
              Add the services you provide so customers can find you.
            </p>

            <div style={styles.form}>
              <div style={styles.inputContainer}>
                <label style={styles.inputLabel}>Service Category</label>
                <select
                  value={serviceCategoryId}
                  onChange={(event) => setServiceCategoryId(event.target.value)}
                  style={styles.input}
                  disabled={serviceSaving || servicesLoading}
                >
                  <option value="">Select a service</option>
                  {serviceCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <InputField
                label="Price (Rs.)"
                type="number"
                value={servicePrice}
                onChange={setServicePrice}
                placeholder="Enter your service price"
              />

              <InputField
                label="Experience (Years)"
                type="number"
                value={serviceExperienceYears}
                onChange={setServiceExperienceYears}
                placeholder="Enter years of experience"
              />

              <div style={styles.inputContainer}>
                <label style={styles.inputLabel}>Service Description</label>
                <textarea
                  value={serviceDescription}
                  onChange={(event) => setServiceDescription(event.target.value)}
                  placeholder="Describe the service you provide"
                  rows={4}
                  style={{
                    ...styles.input,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            <div style={{ ...styles.buttonGroup, marginTop: "20px" }}>
              {editingServiceId && (
                <button
                  type="button"
                  onClick={resetServiceForm}
                  disabled={serviceSaving}
                  style={styles.cancelButton}
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveService}
                disabled={serviceSaving || servicesLoading}
                style={styles.saveButton}
              >
                {serviceSaving
                  ? "Saving..."
                  : editingServiceId
                    ? "Update Service"
                    : "Add Service"}
              </button>
            </div>

            <h3 style={{ color: "#123b70", marginTop: "30px" }}>
              Your Services
            </h3>

            {servicesLoading ? (
              <p>Loading services...</p>
            ) : workerServices.length === 0 ? (
              <p style={{ color: "#64748b" }}>
                No services added yet. Add your first service above.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "15px" }}>
                {workerServices.map((service) => (
                  <div
                    key={service.id}
                    style={{
                      padding: "18px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      background: service.isActive ? "#f8fafc" : "#f3f4f6",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: "0 0 8px", color: "#123b70" }}>
                          {service.category.name}
                        </h4>
                        <p style={{ margin: "5px 0", color: "#374151" }}>
                          Price: Rs. {Number(service.servicePrice).toLocaleString()}
                        </p>
                        <p style={{ margin: "5px 0", color: "#374151" }}>
                          Experience: {service.experienceYears} years
                        </p>
                        <p style={{ margin: "5px 0", color: "#64748b" }}>
                          {service.serviceDescription || "No description added."}
                        </p>
                        <p
                          style={{
                            margin: "8px 0 0",
                            fontWeight: 600,
                            color: service.isActive ? "#15803d" : "#dc2626",
                          }}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>

                      {service.isActive && (
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => handleEditService(service)}
                            style={styles.editButton}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeactivateService(service.id)}
                            style={{ ...styles.cancelButton, background: "#dc2626" }}
                          >
                            Deactivate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {serviceCategories.length === 0 && !servicesLoading && (
              <p style={{ color: "#b45309", marginTop: "12px" }}>
                No active service categories are available. Please contact the administrator.
              </p>
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