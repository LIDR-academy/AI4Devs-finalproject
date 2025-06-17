import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { City } from '../../geography/entities/city.entity';
export declare class Barbershop {
    id: string;
    name: string;
    description: string;
    address: string;
    city_id: string | null;
    neighborhood: string | null;
    owner_name: string | null;
    phone: string;
    email: string;
    openTime: string;
    closeTime: string;
    workingDays: number[];
    timezone: string;
    isActive: boolean;
    logo: string;
    website: string;
    socialMedia: any;
    city: City;
    users: User[];
    appointments: Appointment[];
    createdAt: Date;
    updatedAt: Date;
}
