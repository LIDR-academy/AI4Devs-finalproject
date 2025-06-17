import { UserRole } from '../../../common/enums/user-role.enum';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    profileImage?: string;
    barbershopId?: string;
}
