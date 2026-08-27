import { User } from "./user.types";

export interface Customer {
  id: string;
  userId: string;
  address: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}