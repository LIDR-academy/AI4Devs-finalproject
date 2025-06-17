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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(createUserDto) {
        const user = await this.usersService.create(createUserDto);
        const { password, ...userWithoutPassword } = user;
        return {
            message: 'User created successfully',
            user: userWithoutPassword,
        };
    }
    async findAll(page, limit, role) {
        return this.usersService.findAll(page || 1, limit || 10, role);
    }
    async findByRole(role) {
        return this.usersService.findByRole(role);
    }
    async findBarbersByBarbershop(barbershopId) {
        return this.usersService.findBarbersByBarbershop(barbershopId);
    }
    async findOne(id) {
        const user = await this.usersService.findOne(id);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async update(id, updateUserDto) {
        const user = await this.usersService.update(id, updateUserDto);
        const { password, ...userWithoutPassword } = user;
        return {
            message: 'User updated successfully',
            user: userWithoutPassword,
        };
    }
    async updateProfileImage(id, updateProfileImageDto) {
        const user = await this.usersService.updateProfileImage(id, updateProfileImageDto.profileImage);
        const { password, ...userWithoutPassword } = user;
        return {
            message: 'Profile image updated successfully',
            user: userWithoutPassword,
        };
    }
    async changePassword(id, changePasswordDto) {
        await this.usersService.changePassword(id, changePasswordDto.oldPassword, changePasswordDto.newPassword);
        return {
            message: 'Password changed successfully',
        };
    }
    async activate(id) {
        const user = await this.usersService.activate(id);
        const { password, ...userWithoutPassword } = user;
        return {
            message: 'User activated successfully',
            user: userWithoutPassword,
        };
    }
    async deactivate(id) {
        const user = await this.usersService.deactivate(id);
        const { password, ...userWithoutPassword } = user;
        return {
            message: 'User deactivated successfully',
            user: userWithoutPassword,
        };
    }
    async remove(id) {
        await this.usersService.remove(id);
        return {
            message: 'User deactivated successfully',
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Usuario creado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'El email ya existe',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de usuarios con paginación' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Número de página', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Cantidad de registros por página', example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: user_role_enum_1.UserRole, description: 'Filtrar por rol' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de usuarios obtenida exitosamente',
    }),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('role/:role'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener usuarios por rol específico' }),
    (0, swagger_1.ApiParam)({ name: 'role', enum: user_role_enum_1.UserRole, description: 'Rol a filtrar' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuarios del rol especificado obtenidos exitosamente',
    }),
    __param(0, (0, common_1.Param)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findByRole", null);
__decorate([
    (0, common_1.Get)('barbershop/:barbershopId/barbers'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener barberos de una barbería específica' }),
    (0, swagger_1.ApiParam)({ name: 'barbershopId', description: 'ID de la barbería' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Barberos de la barbería obtenidos exitosamente',
    }),
    __param(0, (0, common_1.Param)('barbershopId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findBarbersByBarbershop", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un usuario por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario obtenido exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario no encontrado',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un usuario' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario actualizado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario no encontrado',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/profile-image'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar imagen de perfil de usuario' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Imagen de perfil actualizada exitosamente',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateProfileImageDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfileImage", null);
__decorate([
    (0, common_1.Patch)(':id/change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cambiar contraseña de usuario' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Contraseña cambiada exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Contraseña actual incorrecta',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activar usuario' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario activado exitosamente',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Desactivar usuario' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario desactivado exitosamente',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar usuario (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario desactivado exitosamente',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map