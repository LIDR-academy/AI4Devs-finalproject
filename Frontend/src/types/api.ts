// Types generated from backend DTOs

export interface TripDto {
  id: string;
  driverId: string;
  origin: {
    lat: number;
    lng: number;
  };
  destinationSedeId: string;
  dateTime: string;
  seatsTotal: number;
  seatsFree: number;
  direction: 'TO_SEDE' | 'FROM_SEDE';
  pairedTripId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripCreateDto {
  origin: {
    lat: number;
    lng: number;
  };
  destinationSedeId: string;
  dateTime: string;
  seatsTotal: number;
  direction: 'TO_SEDE' | 'FROM_SEDE';
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  sedeId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateDto {
  name?: string;
  email?: string;
  sedeId?: string;
}

export interface BookingDto {
  id: string;
  tripId: string;
  passengerId: string;
  seatsRequested: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateDto {
  tripId: string;
  seatsRequested: number;
}

export interface MatchDto {
  id: string;
  tripId: string;
  driverId: string;
  origin: string;
  destinationSedeId: string;
  dateTime: string;
  seatsFree: number;
  score: number;
  reasons: string[];
}

export interface ApiError {
  message: string;
  details?: string;
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
