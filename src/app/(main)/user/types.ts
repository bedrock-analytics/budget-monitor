export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  department: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  activeDaysLast30: number;
}

export interface ActivitySummary {
  totalUsers: number;
  dau: number;
  wau: number;
  mau: number;
  daily: { date: string; count: number }[];
}
