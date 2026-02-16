// User types
export interface User {
    id: string;
    email: string;
    role: 'PLAYER' | 'ADMIN';
    active: boolean;
    createdAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    role: 'PLAYER' | 'ADMIN';
}

// Court types
export interface Court {
    id: string;
    name: string;
    active: boolean;
    createdAt: string;
}

export interface TimeSlot {
    startTime: string;
    endTime: string;
    available: boolean;
}

// Reservation types
export type ReservationStatus = 'CREATED' | 'CONFIRMED';

export interface Reservation {
    id: string;
    courtId: string;
    userId: string;
    startTime: string;
    endTime: string;
    status: ReservationStatus;
    createdAt: string;
    court: {
        id: string;
        name: string;
    };
}

export interface CreateReservationRequest {
    courtId: string;
    startTime: string;
    endTime: string;
}

// Payment types
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Payment {
    id: string;
    reservationId: string;
    userId: string;
    amount: number;
    status: PaymentStatus;
    paymentUrl: string;
    createdAt: string;
}

export interface CreatePaymentRequest {
    reservationId: string;
}

export interface ConfirmPaymentResponse {
    payment: Payment;
    reservation: {
        id: string;
        status: ReservationStatus;
    };
}
