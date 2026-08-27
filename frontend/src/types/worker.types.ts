import { User } from "./user.types";

export type VerificationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface Worker {
  id: string;
  userId: string;
  bio: string | null;
  experienceYears: number;
  averageRating: number;
  totalReviews: number;
  completedJobs: number;
  verificationStatus: VerificationStatus;
  isAvailable: boolean;
  averageResponseMinutes: number | null;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}