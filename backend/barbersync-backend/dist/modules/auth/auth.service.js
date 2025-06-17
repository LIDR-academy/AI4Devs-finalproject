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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("../users/entities/user.entity");
const barbershop_entity_1 = require("../barbershops/entities/barbershop.entity");
const city_entity_1 = require("../geography/entities/city.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const verificationCodes = new Map();
let AuthService = class AuthService {
    usersRepository;
    barbershopsRepository;
    cityRepository;
    jwtService;
    constructor(usersRepository, barbershopsRepository, cityRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.barbershopsRepository = barbershopsRepository;
        this.cityRepository = cityRepository;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, phone, documentId, role, barbershopId, barbershopData } = registerDto;
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        let barbershop = null;
        if (role === user_role_enum_1.UserRole.BARBERSHOP_OWNER) {
            if (!barbershopData) {
                throw new common_1.BadRequestException('Barbershop data is required for barbershop owners');
            }
            const city = await this.cityRepository.findOne({
                where: { id: barbershopData.cityId },
                relations: ['region'],
            });
            if (!city) {
                throw new common_1.BadRequestException('Invalid city ID');
            }
            barbershop = this.barbershopsRepository.create({
                name: barbershopData.name,
                address: barbershopData.address,
                city_id: barbershopData.cityId,
                neighborhood: barbershopData.neighborhood || null,
                owner_name: barbershopData.ownerName || `${firstName} ${lastName}`,
                phone: barbershopData.phone || phone,
                email: barbershopData.email || email,
                description: barbershopData.description || `Barbería ubicada en ${city.name}, ${city.region.name}, ${city.region.country}`,
                isActive: true,
            });
            barbershop = await this.barbershopsRepository.save(barbershop);
        }
        else if (role === user_role_enum_1.UserRole.BARBER) {
            if (!barbershopId) {
                throw new common_1.BadRequestException('Barbershop ID is required for barbers');
            }
            barbershop = await this.barbershopsRepository.findOne({ where: { id: barbershopId } });
            if (!barbershop) {
                throw new common_1.BadRequestException('Invalid barbershop ID');
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role,
            barbershop_id: barbershop?.id || null,
            isActive: true,
            emailVerified: true,
        });
        const savedUser = await this.usersRepository.save(user);
        const payload = {
            email: savedUser.email,
            sub: savedUser.id,
            role: savedUser.role
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: savedUser.id,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                phone: savedUser.phone,
                role: savedUser.role,
                barbershop: barbershop,
                isActive: savedUser.isActive,
            },
            message: 'User registered successfully',
        };
    }
    async verifyEmail(verifyEmailDto) {
        const { email, verificationCode } = verifyEmailDto;
        const storedData = verificationCodes.get(email);
        if (!storedData) {
            throw new common_1.UnauthorizedException('Invalid or expired verification code');
        }
        if (storedData.code !== verificationCode) {
            throw new common_1.UnauthorizedException('Invalid verification code');
        }
        if (new Date() > storedData.expiresAt) {
            verificationCodes.delete(email);
            throw new common_1.UnauthorizedException('Verification code expired');
        }
        const user = this.usersRepository.create({
            email,
            firstName: 'User',
            lastName: 'Name',
            phone: '+1234567890',
            password: await bcrypt.hash('temporary', 10),
            role: user_role_enum_1.UserRole.CLIENT,
        });
        const savedUser = await this.usersRepository.save(user);
        verificationCodes.delete(email);
        const payload = {
            email: savedUser.email,
            sub: savedUser.id,
            role: savedUser.role
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: savedUser.id,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                role: savedUser.role,
            },
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersRepository.findOne({
            where: { email },
            relations: ['barbershop'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        user.lastLogin = new Date();
        await this.usersRepository.save(user);
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                barbershop: user.barbershop,
                isActive: user.isActive,
            },
        };
    }
    async validateUser(email) {
        const user = await this.usersRepository.findOne({
            where: { email },
            relations: ['barbershop'],
        });
        return user;
    }
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    generateTemporaryPassword() {
        return Math.random().toString(36).slice(-8);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(barbershop_entity_1.Barbershop)),
    __param(2, (0, typeorm_1.InjectRepository)(city_entity_1.City)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map