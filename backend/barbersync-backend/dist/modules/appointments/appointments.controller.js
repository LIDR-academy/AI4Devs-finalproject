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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const appointments_service_1 = require("./appointments.service");
const create_appointment_dto_1 = require("./dto/create-appointment.dto");
const update_appointment_dto_1 = require("./dto/update-appointment.dto");
const get_appointments_dto_1 = require("./dto/get-appointments.dto");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let AppointmentsController = class AppointmentsController {
    appointmentsService;
    constructor(appointmentsService) {
        this.appointmentsService = appointmentsService;
    }
    async create(createAppointmentDto, req) {
        const appointment = await this.appointmentsService.create(createAppointmentDto);
        return {
            message: 'Cita creada exitosamente',
            appointment,
        };
    }
    async findAll(query) {
        const result = await this.appointmentsService.findAll(query);
        return {
            message: 'Citas obtenidas exitosamente',
            data: result.appointments,
            meta: {
                total: result.total,
                totalPages: result.totalPages,
                currentPage: query.page || 1,
                limit: query.limit || 10,
            },
        };
    }
    async getMyAppointments(req, query) {
        const user = req.user;
        const filters = { ...query };
        if (user.role === user_role_enum_1.UserRole.CLIENT) {
            filters.client_id = user.id;
        }
        else if (user.role === user_role_enum_1.UserRole.BARBER) {
            filters.barber_id = user.id;
        }
        else if (user.role === user_role_enum_1.UserRole.BARBERSHOP_OWNER && user.barbershop_id) {
            filters.barbershop_id = user.barbershop_id;
        }
        const result = await this.appointmentsService.findAll(filters);
        return {
            message: 'Citas obtenidas exitosamente',
            data: result.appointments,
            meta: {
                total: result.total,
                totalPages: result.totalPages,
                currentPage: query.page || 1,
                limit: query.limit || 10,
            },
        };
    }
    async getAvailableSlots(barberId, date, duration) {
        const slots = await this.appointmentsService.getAvailableTimeSlots(barberId, date, duration ? parseInt(duration) : 60);
        return {
            message: 'Horarios disponibles obtenidos exitosamente',
            date,
            barberId,
            availableSlots: slots,
        };
    }
    async findOne(id) {
        const appointment = await this.appointmentsService.findOne(id);
        return {
            message: 'Cita obtenida exitosamente',
            appointment,
        };
    }
    async update(id, updateAppointmentDto, req) {
        const user = req.user;
        const appointment = await this.appointmentsService.update(id, updateAppointmentDto, user.id);
        return {
            message: 'Cita actualizada exitosamente',
            appointment,
        };
    }
    async cancel(id, req) {
        const user = req.user;
        const appointment = await this.appointmentsService.cancel(id, user.id);
        return {
            message: 'Cita cancelada exitosamente',
            appointment,
        };
    }
    async confirm(id) {
        const appointment = await this.appointmentsService.confirm(id);
        return {
            message: 'Cita confirmada exitosamente',
            appointment,
        };
    }
    async complete(id) {
        const appointment = await this.appointmentsService.complete(id);
        return {
            message: 'Cita marcada como completada exitosamente',
            appointment,
        };
    }
    async remove(id) {
        await this.appointmentsService.remove(id);
        return {
            message: 'Cita eliminada exitosamente',
        };
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva cita' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cita creada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o conflicto de horario' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cliente, barbero o barbería no encontrada' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_appointment_dto_1.CreateAppointmentDto, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener citas con filtros y paginación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de citas obtenida exitosamente' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_appointments_dto_1.GetAppointmentsDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-appointments'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener citas del usuario actual' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Citas del usuario obtenidas exitosamente' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_appointments_dto_1.GetAppointmentsDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getMyAppointments", null);
__decorate([
    (0, common_1.Get)('available-slots/:barberId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener horarios disponibles para un barbero' }),
    (0, swagger_1.ApiQuery)({ name: 'date', description: 'Fecha en formato YYYY-MM-DD', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'duration', description: 'Duración en minutos', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Horarios disponibles obtenidos exitosamente' }),
    __param(0, (0, common_1.Param)('barberId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('duration')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getAvailableSlots", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener cita por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cita obtenida exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cita no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar cita' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cita actualizada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o no se puede modificar' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cita no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_appointment_dto_1.UpdateAppointmentDto, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar cita' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cita cancelada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No se puede cancelar la cita' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cita no encontrada' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirmar cita' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cita confirmada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cita no encontrada' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar cita como completada' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cita marcada como completada' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cita no encontrada' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "complete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar cita' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cita eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cita no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "remove", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, swagger_1.ApiTags)('appointments'),
    (0, common_1.Controller)('appointments'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map