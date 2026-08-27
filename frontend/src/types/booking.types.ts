import { Customer } from "./customer.types";
import { Worker } from "./worker.types";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "ON_THE_WAY"
  | "WORKING"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface WorkerService {
  id: string;
  workerId: string;
  categoryId: string;
  servicePrice: string;
  serviceDescription: string;
  experienceYears: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface Booking {
  id: string;
  customerId: string;
  workerId: string;
  workerServiceId: string;
  bookingDate: string;
  estimatedDuration: number;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  totalAmount: string;
  platformFee: string;
  workerAmount: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  referenceImage: string | null;

  customer?: Customer;
  worker?: Worker;
  workerService?: WorkerService;
}