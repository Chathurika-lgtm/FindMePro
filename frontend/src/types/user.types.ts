export type UserRole = "ADMIN" | "WORKER" | "CUSTOMER";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  profileImage?: string | null;
  updatedAt?: string;
  createdAt?: string;
}