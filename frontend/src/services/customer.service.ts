import api from "@/lib/axios";

export interface CustomerProfile {
  id: string;
  userId: string;

  address: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;

  latitude: number | null;
  longitude: number | null;

  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    profileImage: string | null;
    role: "CUSTOMER";
    status: "ACTIVE" | "INACTIVE";
  };
}

export interface UpdateCustomerProfileData {
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

// =========================
// GET CUSTOMER PROFILE
// =========================

export const getCustomerProfile = async (): Promise<CustomerProfile> => {
  const response = await api.get<CustomerProfile>(
    "/customer/profile",
  );

  return response.data;
};

// =========================
// UPDATE CUSTOMER PROFILE
// =========================

export const updateCustomerProfile = async (
  data: UpdateCustomerProfileData,
): Promise<CustomerProfile> => {
  const response = await api.put<CustomerProfile>(
    "/customer/profile",
    data,
  );

  return response.data;
};