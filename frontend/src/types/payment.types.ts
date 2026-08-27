export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "ONLINE"
  | "BANK_TRANSFER";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference: string | null;
  paidAt: string | null;
  createdAt: string;
}