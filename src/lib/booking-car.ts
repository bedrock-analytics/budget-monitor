export interface CarBookingUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
}

export interface CarBookingPassenger {
  id: string;
  bookingId: string;
  userId: string | null;
  role: string;
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  usePersonalCar: boolean;
  user: CarBookingUser | null;
}

export interface CarBookingHotel {
  id: string;
  bookingId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface CarBookingFlight {
  id: string;
  bookingId: string;
  flightNumber: string | null;
  airline: string | null;
  route: string;
  departureTime: string;
  arrivalTime: string;
  notes: string | null;
}

export interface CarBookingTrip {
  id: string;
  bookingId: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  description: string | null;
}

export interface CarBookingRow {
  id: string;
  bookingNumber: string;
  userId: string;
  projectCode: string | null;
  projectType: string | null;
  type: string | null;
  carName: string;
  licensePlate: string;
  purpose: string;
  destination: string | null;
  startDate: string;
  endDate: string;
  status: CarBookingStatus;
  notes: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: CarBookingUser;
  passengers: CarBookingPassenger[];
  hotels: CarBookingHotel[];
  flights: CarBookingFlight[];
  trips: CarBookingTrip[];
}

export type CarBookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "IN_USE"
  | "RETURNED"
  | "CANCELLED";

export const CAR_OPTIONS = [
  { name: "Taxi", licensePlate: "กข-1" },
  { name: "Van", licensePlate: "กข-2" },
  { name: "Van (Take off seat)", licensePlate: "กข-3" },
  { name: "Other (please specify at note box)", licensePlate: "กข-4" },
  // { name: "Toyota Hilux Revo", licensePlate: "กค-5678" },
  // { name: "Ford Ranger", licensePlate: "ขก-9012" },
  // { name: "Isuzu D-Max", licensePlate: "คก-3456" },
  // { name: "Mitsubishi Triton", licensePlate: "จก-7890" },
] as const;

export function generateBookingNumber(): string {
  const now = new Date();
  const yymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CB-${yymm}-${rand}`;
}

export function formatStatus(status: CarBookingStatus): string {
  const map: Record<CarBookingStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    IN_USE: "In Use",
    RETURNED: "Returned",
    CANCELLED: "Cancelled",
  };
  return map[status];
}

export function getStatusColor(status: CarBookingStatus): string {
  const map: Record<CarBookingStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    IN_USE: "bg-blue-100 text-blue-800",
    RETURNED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-gray-100 text-gray-500",
  };
  return map[status];
}
