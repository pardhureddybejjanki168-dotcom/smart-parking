export type Role = 'USER' | 'ADMIN';
export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
export type SlotType = 'TWO_WHEELER' | 'FOUR_WHEELER' | 'ACCESSIBLE' | 'ELECTRIC' | 'OTHER';
export type VehicleType = 'TWO_WHEELER' | 'FOUR_WHEELER' | 'ACCESSIBLE' | 'ELECTRIC' | 'OTHER';
export type SessionStatus = 'ACTIVE' | 'COMPLETED';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleType: VehicleType;
  make: string;
  model: string;
  color: string;
  ownerName: string;
  ownerPhone: string;
  userId: string;
  active: boolean;
  createdAt: string;
}

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  slotType: SlotType;
  status: SlotStatus;
  vehicleId?: string;
  currentVehicleNumber?: string;
  activeParkingRecordId?: string;
  updatedAt: string;
}

export interface ParkingRecord {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  slotId: string;
  slotNumber: string;
  userId: string;
  entryTime: string;
  exitTime?: string;
  status: SessionStatus;
  createdAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  vehicleId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  createdAt: string;
  vehicleRegistrationNumber?: string;
  slotNumber?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface UserDashboard {
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  reservedSlots: number;
  userActiveSessions: number;
  userVehicles: number;
}

export interface AdminDashboard {
  totalUsers: number;
  totalVehicles: number;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  reservedSlots: number;
  activeSessions: number;
  completedToday: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  metadata?: string;
}

export interface AnalyticsReport {
  period: string;
  dailyEntries: { date: string; entries: number; exits: number }[];
  utilizationByType: { type: string; count: number; utilizationPercent: number }[];
  sessionStatusDistribution: { status: string; count: number }[];
  reservationStats?: { total: number; confirmed: number; cancelled: number; expired: number };
}
