import { BookingStatus } from "./booking.types";

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  status: BookingStatus;
  remarks: string | null;
  changedAt: string;
}