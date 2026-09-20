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

export const getPublicWorkers = async (): Promise<PublicWorker[]> => {
  const response = await api.get<PublicWorker[]>("/worker/public");

  return response.data;
};

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


export const getPublicWorkerById = async (
  workerId: string,
): Promise<PublicWorker> => {
  const response = await api.get<PublicWorker>(
    `/worker/public/${workerId}`,
  );

  return response.data;
};