import api from "@/lib/axios";

export interface CustomerBooking {
  id: string;
  status: string;
  bookingDate?: string;
  totalAmount?: number;
  createdAt?: string;
}

export const getMyBookings = async (): Promise<CustomerBooking[]> => {
  const response = await api.get<CustomerBooking[]>(
    "/booking/my-bookings",
  );

  return response.data;
};