import { UserRole } from '../../../common/enums/user-role.enum';
declare class BarbershopDataDto {
    name: string;
    address: string;
    cityId: string;
    neighborhood?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    description?: string;
    openingHours?: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    documentId?: string;
    role: UserRole;
    barbershopId?: string;
    barbershopData?: BarbershopDataDto;
}
export {};
