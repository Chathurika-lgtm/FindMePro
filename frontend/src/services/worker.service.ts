import api from "@/lib/axios";

export interface WorkerService {
  id: string;
  servicePrice: string;
  serviceDescription: string | null;
  experienceYears: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
    isActive: boolean;
    slug: string;
  };
}

export interface WorkerSkill {
  id: string;
  skill: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface WorkerGallery {
  id: string;
  workerId: string;
  imageUrl: string;
  title: string | null;
  displayOrder: number;
  description: string | null;
  createdAt: string;
}

export interface WorkerAvailability {
  id: string;
  workerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

export interface PublicWorker {
  id: string;
  userId: string;
  bio: string | null;
  experienceYears: number;
  averageRating: number;
  totalReviews: number;
  completedJobs: number;
  verificationStatus: string;
  isAvailable: boolean;

  user: {
    id: string;
    fullName: string;
    phone: string | null;
    profileImage: string | null;
    status: string;
  };

  services: WorkerService[];
  skills: WorkerSkill[];
  gallery: WorkerGallery[];
  availability: WorkerAvailability[];
}

/**
 * Get public workers.
 *
 * When a service is provided, the backend filters workers
 * by that service category.
 *
 * Examples:
 * getPublicWorkers()
 * getPublicWorkers("Electrician")
 * getPublicWorkers("Plumber")
 */
export const getPublicWorkers = async (
  service?: string,
): Promise<PublicWorker[]> => {
  const trimmedService = service?.trim();

  const response = await api.get<PublicWorker[]>("/worker/public", {
    params: trimmedService
      ? {
          service: trimmedService,
        }
      : undefined,
  });

  return response.data;
};

/**
 * Get a single worker's public profile.
 */
export const getPublicWorkerById = async (
  workerId: string,
): Promise<PublicWorker> => {
  const response = await api.get<PublicWorker>(
    `/worker/public/${workerId}`,
  );

  return response.data;
};

/**
 * Get the currently authenticated worker's profile.
 */
export const getWorkerProfile = async () => {
  const response = await api.get("/worker/profile");

  return response.data;
};

export interface WorkerServiceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  slug: string;
}

export const getWorkerCategories = async (): Promise<
  WorkerServiceCategory[]
> => {
  const response = await api.get<WorkerServiceCategory[]>(
    "/worker/categories",
  );

  return response.data;
};

export const getMyWorkerServices = async (): Promise<WorkerService[]> => {
  const response = await api.get<WorkerService[]>("/worker/services");

  return response.data;
};