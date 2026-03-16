"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("./entities/user.entity");
const barbershop_entity_1 = require("../barbershops/entities/barbershop.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let UsersService = class UsersService {
    usersRepository;
    barbershopsRepository;
    constructor(usersRepository, barbershopsRepository) {
        this.usersRepository = usersRepository;
        this.barbershopsRepository = barbershopsRepository;
    }
    async create(createUserDto) {
        const { email, password, barbershopId, ...userData } = createUserDto;
        const existingUser = await this.usersRepository.findOne({
            where: { email }
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        if (barbershopId && (createUserDto.role === user_role_enum_1.UserRole.BARBER || createUserDto.role === user_role_enum_1.UserRole.BARBERSHOP_OWNER)) {
            const barbershop = await this.barbershopsRepository.findOne({
                where: { id: barbershopId }
            });
            if (!barbershop) {
                throw new common_1.BadRequestException('Invalid barbershop ID');
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            ...userData,
            email,
            password: hashedPassword,
            barbershop_id: barbershopId || undefined,
        });
        return this.usersRepository.save(user);
    }
    async findAll(page = 1, limit = 10, role) {
        const queryBuilder = this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.barbershop', 'barbershop')
            .select([
            'user.id',
            'user.email',
            'user.firstName',
            'user.lastName',
            'user.phone',
            'user.role',
            'user.isActive',
            'user.profileImage',
            'user.createdAt',
            'barbershop.id',
            'barbershop.name',
            'barbershop.address'
        ]);
        if (role) {
            queryBuilder.where('user.role = :role', { role });
        }
        const [users, total] = await queryBuilder
            .orderBy('user.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            users,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['barbershop', 'clientAppointments', 'barberAppointments'],
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
                barbershop: {
                    id: true,
                    name: true,
                    address: true,
                    phone: true,
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email },
            relations: ['barbershop'],
        });
    }
    async findByRole(role) {
        return this.usersRepository.find({
            where: { role },
            relations: ['barbershop'],
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                profileImage: true,
                barbershop: {
                    id: true,
                    name: true,
                    address: true,
                },
            },
        });
    }
    async findBarbersByBarbershop(barbershopId) {
        return this.usersRepository.find({
            where: {
                barbershop_id: barbershopId,
                role: user_role_enum_1.UserRole.BARBER,
                isActive: true,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profileImage: true,
            },
        });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.usersRepository.findOne({
                where: { email: updateUserDto.email }
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        if (updateUserDto.barbershopId) {
            const barbershop = await this.barbershopsRepository.findOne({
                where: { id: updateUserDto.barbershopId }
            });
            if (!barbershop) {
                throw new common_1.BadRequestException('Invalid barbershop ID');
            }
        }
        await this.usersRepository.update(id, {
            ...updateUserDto,
            barbershop_id: updateUserDto.barbershopId || user.barbershop_id,
        });
        return this.findOne(id);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.usersRepository.update(id, { isActive: false });
    }
    async activate(id) {
        const user = await this.findOne(id);
        if (user.isActive) {
            throw new common_1.BadRequestException('User is already active');
        }
        await this.usersRepository.update(id, { isActive: true });
        return this.findOne(id);
    }
    async deactivate(id) {
        const user = await this.findOne(id);
        if (!user.isActive) {
            throw new common_1.BadRequestException('User is already inactive');
        }
        await this.usersRepository.update(id, { isActive: false });
        return this.findOne(id);
    }
    async updateProfileImage(id, profileImage) {
        await this.usersRepository.update(id, { profileImage });
        return this.findOne(id);
    }
    async changePassword(id, oldPassword, newPassword) {
        const user = await this.usersRepository.findOne({
            where: { id },
            select: ['id', 'password'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new common_1.BadRequestException('Invalid old password');
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.usersRepository.update(id, { password: hashedNewPassword });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(barbershop_entity_1.Barbershop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map