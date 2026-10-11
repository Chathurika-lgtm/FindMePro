import api from "@/lib/axios";

export interface CustomerBooking {
  id: string;
  status: string;
  bookingDate?: string;
  totalAmount?: number;
  createdAt?: string;
}

export interface CreateBookingData {
  workerId: string;
  workerServiceId: string;
  bookingDate: string;
  estimatedDuration?: number;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  referenceImage?: string;
}

export const getMyBookings = async (): Promise<CustomerBooking[]> => {
  const response = await api.get<CustomerBooking[]>(
    "/booking/my-bookings",
  );

  return response.data;
};

export const createBooking = async (
  data: CreateBookingData,
) => {
  const response = await api.post(
    "/booking",
    data,
  );

  return response.data;
};

export const getWorkerBookings = async (): Promise<CustomerBooking[]> => {
  const response = await api.get<CustomerBooking[]>(
    "/booking/worker-bookings",
  );

  return response.data;
};

export const acceptBooking = async (bookingId: string) => {
  const response = await api.put(
    `/booking/${bookingId}/accept`,
  );

  return response.data;
};

export const markBookingOnTheWay = async (
  bookingId: string,
) => {
  const response = await api.put(
    `/booking/${bookingId}/on-the-way`,
  );

  return response.data;
};

export const startBookingWork = async (
  bookingId: string,
) => {
  const response = await api.put(
    `/booking/${bookingId}/start-work`,
  );

  return response.data;
};

export const completeBookingWork = async (
  bookingId: string,
) => {
  const response = await api.put(
    `/booking/${bookingId}/complete`,
  );

  return response.data;
};

export const cancelBooking = async (
  bookingId: string,
) => {
  const response = await api.put(
    `/booking/${bookingId}/cancel`,
    {
      remarks: "Booking cancelled by customer",
    },
  );

  return response.data;
};