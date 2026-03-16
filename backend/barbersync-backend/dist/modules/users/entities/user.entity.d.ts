import { UserRole } from '../../../common/enums/user-role.enum';
import { Barbershop } from '../../barbershops/entities/barbershop.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
    profileImage: string;
    dateOfBirth: Date;
    gender: string;
    emailVerified: boolean;
    emailVerificationToken: string;
    passwordResetToken: string;
    passwordResetExpires: Date;
    lastLogin: Date;
    barbershop: Barbershop;
    barbershop_id: string | null;
    clientAppointments: Appointment[];
    barberAppointments: Appointment[];
    createdAt: Date;
    updatedAt: Date;
}
