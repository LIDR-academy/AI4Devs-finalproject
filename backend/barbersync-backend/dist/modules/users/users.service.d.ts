import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Barbershop } from '../barbershops/entities/barbershop.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class UsersService {
    private usersRepository;
    private barbershopsRepository;
    constructor(usersRepository: Repository<User>, barbershopsRepository: Repository<Barbershop>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(page?: number, limit?: number, role?: UserRole): Promise<{
        users: User[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByRole(role: UserRole): Promise<User[]>;
    findBarbersByBarbershop(barbershopId: string): Promise<User[]>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    activate(id: string): Promise<User>;
    deactivate(id: string): Promise<User>;
    updateProfileImage(id: string, profileImage: string): Promise<User>;
    changePassword(id: string, oldPassword: string, newPassword: string): Promise<void>;
}
