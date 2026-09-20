import api from "@/lib/axios";
import { setToken } from "@/lib/token";

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE";
  profileImage?: string;
}

export interface AuthUser {
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
  deletedAt?: string | null;
  customerProfile?: unknown;
}

export interface LoginUser {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "WORKER" | "CUSTOMER";
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: LoginUser;
}

// =========================
// REGISTER
// =========================

export const register = async (
  data: RegisterData,
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>(
    "/auth/register",
    data,
  );

  return response.data;
};

// =========================
// LOGIN
// =========================

export const login = async (
  data: LoginData,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data,
  );

  setToken(response.data.accessToken);

  return response.data;
};

// =========================
// PROFILE
// =========================

export const getProfile = async () => {
  const response = await api.get("/auth/profile");

  return response.data;
};

// =========================
// UPDATE PROFILE
// =========================

export const updateProfile = async (
  data: UpdateProfileData,
) => {
  const response = await api.put(
    "/auth/profile",
    data,
  );

  return response.data;
};

export const uploadProfileImage = async (
  file: File,
) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post(
    "/auth/profile/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
// =========================
// ADMIN
// =========================

export const getAdminData = async () => {
  const response = await api.get("/auth/admin");

  return response.data;
};

// =========================
// CUSTOMER
// =========================

export const getCustomerData = async () => {
  const response = await api.get("/auth/customer");

  return response.data;
};

// =========================
// WORKER
// =========================

export const getWorkerData = async () => {
  const response = await api.get("/auth/worker");

  return response.data;
};

// =========================
// DASHBOARD
// =========================

export const getDashboard = async () => {
  const response = await api.get("/auth/dashboard");

  return response.data;
};