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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("./entities/appointment.entity");
const appointment_status_enum_1 = require("../../common/enums/appointment-status.enum");
const user_entity_1 = require("../users/entities/user.entity");
const barbershop_entity_1 = require("../barbershops/entities/barbershop.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let AppointmentsService = class AppointmentsService {
    appointmentRepository;
    userRepository;
    barbershopRepository;
    constructor(appointmentRepository, userRepository, barbershopRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.barbershopRepository = barbershopRepository;
    }
    async create(createAppointmentDto) {
        const client = await this.userRepository.findOne({
            where: { id: createAppointmentDto.client_id, role: user_role_enum_1.UserRole.CLIENT },
        });
        if (!client) {
            throw new common_1.NotFoundException('Cliente no encontrado');
        }
        const barber = await this.userRepository.findOne({
            where: { id: createAppointmentDto.barber_id, role: user_role_enum_1.UserRole.BARBER },
        });
        if (!barber) {
            throw new common_1.NotFoundException('Barbero no encontrado');
        }
        const barbershop = await this.barbershopRepository.findOne({
            where: { id: createAppointmentDto.barbershop_id },
        });
        if (!barbershop) {
            throw new common_1.NotFoundException('Barbería no encontrada');
        }
        const appointmentDateTime = new Date(`${createAppointmentDto.appointmentDate}T${createAppointmentDto.startTime}`);
        const now = new Date();
        const timeDifference = appointmentDateTime.getTime() - now.getTime();
        const minAdvanceTimeMs = 2 * 60 * 60 * 1000;
        if (timeDifference < minAdvanceTimeMs) {
            throw new common_1.BadRequestException('Las citas deben agendarse con al menos 2 horas de anticipación');
        }
        await this.validateTimeSlotAvailability(createAppointmentDto.barber_id, createAppointmentDto.appointmentDate, createAppointmentDto.startTime, createAppointmentDto.endTime);
        await this.validateBarbershopWorkingHours(createAppointmentDto.barbershop_id, createAppointmentDto.startTime, createAppointmentDto.endTime);
        const appointment = this.appointmentRepository.create({
            client_id: createAppointmentDto.client_id,
            barber_id: createAppointmentDto.barber_id,
            barbershop_id: createAppointmentDto.barbershop_id,
            appointmentDate: new Date(createAppointmentDto.appointmentDate),
            startTime: createAppointmentDto.startTime,
            endTime: createAppointmentDto.endTime,
            serviceName: createAppointmentDto.serviceDescription,
            clientNotes: createAppointmentDto.notes,
            price: createAppointmentDto.price ? parseFloat(createAppointmentDto.price) : undefined,
            status: createAppointmentDto.status || appointment_status_enum_1.AppointmentStatus.PENDING,
        });
        return await this.appointmentRepository.save(appointment);
    }
    async findAll(query) {
        const { page = 1, limit = 10, ...filters } = query;
        const skip = (page - 1) * limit;
        try {
            const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment');
            if (filters.barber_id) {
                queryBuilder.andWhere('appointment.barber_id = :barber_id', { barber_id: filters.barber_id });
            }
            if (filters.client_id) {
                queryBuilder.andWhere('appointment.client_id = :client_id', { client_id: filters.client_id });
            }
            if (filters.barbershop_id) {
                queryBuilder.andWhere('appointment.barbershop_id = :barbershop_id', { barbershop_id: filters.barbershop_id });
            }
            if (filters.status) {
                queryBuilder.andWhere('appointment.status = :status', { status: filters.status });
            }
            if (filters.startDate && filters.endDate) {
                queryBuilder.andWhere('appointment.scheduled_date BETWEEN :startDate AND :endDate', {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                });
            }
            else if (filters.startDate) {
                queryBuilder.andWhere('appointment.scheduled_date >= :startDate', { startDate: filters.startDate });
            }
            else if (filters.endDate) {
                queryBuilder.andWhere('appointment.scheduled_date <= :endDate', { endDate: filters.endDate });
            }
            queryBuilder.orderBy('appointment.scheduled_date', 'DESC')
                .addOrderBy('appointment.start_time', 'ASC')
                .skip(skip)
                .take(limit);
            const [appointments, total] = await queryBuilder.getManyAndCount();
            for (const appointment of appointments) {
                const [client, barber, barbershop] = await Promise.all([
                    this.userRepository.findOne({ where: { id: appointment.client_id } }),
                    this.userRepository.findOne({ where: { id: appointment.barber_id } }),
                    this.barbershopRepository.findOne({ where: { id: appointment.barbershop_id } }),
                ]);
                if (client)
                    appointment.client = client;
                if (barber)
                    appointment.barber = barber;
                if (barbershop)
                    appointment.barbershop = barbershop;
            }
            const totalPages = Math.ceil(total / limit);
            return { appointments, total, totalPages };
        }
        catch (error) {
            console.error('Error en findAll appointments:', error);
            throw error;
        }
    }
    async findOne(id) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ['client', 'barber', 'barbershop', 'barbershop.city', 'barbershop.city.region'],
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Cita no encontrada');
        }
        return appointment;
    }
    async update(id, updateAppointmentDto, userId) {
        const appointment = await this.findOne(id);
        if (updateAppointmentDto.appointmentDate || updateAppointmentDto.startTime) {
            const newDate = updateAppointmentDto.appointmentDate || appointment.appointmentDate.toISOString().split('T')[0];
            const newStartTime = updateAppointmentDto.startTime || appointment.startTime;
            const appointmentDateTime = new Date(`${newDate}T${newStartTime}`);
            const now = new Date();
            const timeDifference = appointmentDateTime.getTime() - now.getTime();
            const minAdvanceTimeMs = 2 * 60 * 60 * 1000;
            if (timeDifference < minAdvanceTimeMs) {
                throw new common_1.BadRequestException('Las citas deben modificarse con al menos 2 horas de anticipación');
            }
            if (updateAppointmentDto.startTime || updateAppointmentDto.endTime) {
                await this.validateTimeSlotAvailability(updateAppointmentDto.barber_id || appointment.barber_id, newDate, updateAppointmentDto.startTime || appointment.startTime, updateAppointmentDto.endTime || appointment.endTime, id);
            }
        }
        if (updateAppointmentDto.appointmentDate) {
            appointment.appointmentDate = new Date(updateAppointmentDto.appointmentDate);
        }
        if (updateAppointmentDto.startTime) {
            appointment.startTime = updateAppointmentDto.startTime;
        }
        if (updateAppointmentDto.endTime) {
            appointment.endTime = updateAppointmentDto.endTime;
        }
        if (updateAppointmentDto.serviceDescription) {
            appointment.serviceName = updateAppointmentDto.serviceDescription;
        }
        if (updateAppointmentDto.notes) {
            appointment.clientNotes = updateAppointmentDto.notes;
        }
        if (updateAppointmentDto.price) {
            appointment.price = parseFloat(updateAppointmentDto.price);
        }
        if (updateAppointmentDto.status) {
            appointment.status = updateAppointmentDto.status;
        }
        return await this.appointmentRepository.save(appointment);
    }
    async cancel(id, userId) {
        const appointment = await this.findOne(id);
        const appointmentDateTime = new Date(`${appointment.appointmentDate.toISOString().split('T')[0]}T${appointment.startTime}`);
        const now = new Date();
        const timeDifference = appointmentDateTime.getTime() - now.getTime();
        const minAdvanceTimeMs = 2 * 60 * 60 * 1000;
        if (timeDifference < minAdvanceTimeMs) {
            throw new common_1.BadRequestException('Las citas deben cancelarse con al menos 2 horas de anticipación');
        }
        appointment.status = appointment_status_enum_1.AppointmentStatus.CANCELLED;
        appointment.cancelledAt = new Date();
        return await this.appointmentRepository.save(appointment);
    }
    async complete(id) {
        const appointment = await this.findOne(id);
        appointment.status = appointment_status_enum_1.AppointmentStatus.COMPLETED;
        appointment.completedAt = new Date();
        return await this.appointmentRepository.save(appointment);
    }
    async confirm(id) {
        const appointment = await this.findOne(id);
        appointment.status = appointment_status_enum_1.AppointmentStatus.CONFIRMED;
        appointment.confirmedAt = new Date();
        return await this.appointmentRepository.save(appointment);
    }
    async remove(id) {
        const appointment = await this.findOne(id);
        await this.appointmentRepository.remove(appointment);
    }
    async getAvailableTimeSlots(barberId, date, duration = 60) {
        const barber = await this.userRepository.findOne({
            where: { id: barberId, role: user_role_enum_1.UserRole.BARBER },
            relations: ['barbershop'],
        });
        if (!barber || !barber.barbershop) {
            throw new common_1.NotFoundException('Barbero o barbería no encontrada');
        }
        const existingAppointments = await this.appointmentRepository.find({
            where: {
                barber_id: barberId,
                appointmentDate: new Date(date),
                status: (0, typeorm_2.Not)(appointment_status_enum_1.AppointmentStatus.CANCELLED),
            },
        });
        const workingHours = this.generateWorkingHours(barber.barbershop.openTime, barber.barbershop.closeTime);
        const availableSlots = this.filterAvailableSlots(workingHours, existingAppointments, duration);
        return availableSlots;
    }
    async validateTimeSlotAvailability(barberId, date, startTime, endTime, excludeAppointmentId) {
        const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment')
            .where('appointment.barber_id = :barberId', { barberId })
            .andWhere('appointment.scheduled_date = :date', { date })
            .andWhere('appointment.status != :cancelledStatus', { cancelledStatus: appointment_status_enum_1.AppointmentStatus.CANCELLED })
            .andWhere('(appointment.start_time < :endTime AND appointment.end_time > :startTime)', { startTime, endTime });
        if (excludeAppointmentId) {
            queryBuilder.andWhere('appointment.id != :excludeId', { excludeId: excludeAppointmentId });
        }
        const conflictingAppointment = await queryBuilder.getOne();
        if (conflictingAppointment) {
            throw new common_1.BadRequestException('El horario seleccionado no está disponible');
        }
    }
    async validateBarbershopWorkingHours(barbershopId, startTime, endTime) {
        const barbershop = await this.barbershopRepository.findOne({
            where: { id: barbershopId },
        });
        if (!barbershop || !barbershop.openTime || !barbershop.closeTime) {
            return;
        }
        const appointmentStart = this.timeToMinutes(startTime);
        const appointmentEnd = this.timeToMinutes(endTime);
        const workingStart = this.timeToMinutes(barbershop.openTime);
        const workingEnd = this.timeToMinutes(barbershop.closeTime);
        if (appointmentStart < workingStart || appointmentEnd > workingEnd) {
            throw new common_1.BadRequestException(`La cita debe estar dentro del horario de atención: ${barbershop.openTime} - ${barbershop.closeTime}`);
        }
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    generateWorkingHours(openTime, closeTime) {
        const slots = [];
        let current = this.timeToMinutes(openTime);
        const end = this.timeToMinutes(closeTime);
        const slotDuration = 60;
        while (current < end) {
            const hours = Math.floor(current / 60);
            const minutes = current % 60;
            slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
            current += slotDuration;
        }
        return slots;
    }
    filterAvailableSlots(workingHours, existingAppointments, duration) {
        return workingHours.filter((slot) => {
            const slotStart = this.timeToMinutes(slot);
            const slotEnd = slotStart + duration;
            return !existingAppointments.some((appointment) => {
                const appointmentStart = this.timeToMinutes(appointment.startTime);
                const appointmentEnd = this.timeToMinutes(appointment.endTime);
                return (slotStart < appointmentEnd && slotEnd > appointmentStart);
            });
        });
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(barbershop_entity_1.Barbershop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map