import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { Barbershop } from '../barbershops/entities/barbershop.entity';
import { City } from '../geography/entities/city.entity';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class AuthService {
    private usersRepository;
    private barbershopsRepository;
    private cityRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, barbershopsRepository: Repository<Barbershop>, cityRepository: Repository<City>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            role: UserRole;
            barbershop: Barbershop | null;
            isActive: boolean;
        };
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: UserRole;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            role: UserRole;
            barbershop: Barbershop;
            isActive: boolean;
        };
    }>;
    validateUser(email: string): Promise<any>;
    private generateVerificationCode;
    private generateTemporaryPassword;
}
