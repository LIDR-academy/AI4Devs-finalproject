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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = void 0;
const typeorm_1 = require("typeorm");
const appointment_status_enum_1 = require("../../../common/enums/appointment-status.enum");
const user_entity_1 = require("../../users/entities/user.entity");
const barbershop_entity_1 = require("../../barbershops/entities/barbershop.entity");
let Appointment = class Appointment {
    id;
    appointmentDate;
    startTime;
    endTime;
    status;
    service_id;
    serviceName;
    price;
    durationMinutes;
    clientNotes;
    barberNotes;
    adminNotes;
    confirmedAt;
    startedAt;
    completedAt;
    cancelledAt;
    client;
    client_id;
    barber;
    barber_id;
    barbershop;
    barbershop_id;
    createdAt;
    updatedAt;
    get serviceDescription() {
        return this.serviceName;
    }
    set serviceDescription(value) {
        this.serviceName = value;
    }
    get notes() {
        return this.clientNotes;
    }
    set notes(value) {
        this.clientNotes = value;
    }
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', name: 'scheduled_date' }),
    __metadata("design:type", Date)
], Appointment.prototype, "appointmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', name: 'start_time' }),
    __metadata("design:type", String)
], Appointment.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', name: 'end_time' }),
    __metadata("design:type", String)
], Appointment.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: appointment_status_enum_1.AppointmentStatus,
        default: appointment_status_enum_1.AppointmentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'service_id' }),
    __metadata("design:type", String)
], Appointment.prototype, "service_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'service_name' }),
    __metadata("design:type", String)
], Appointment.prototype, "serviceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'duration_minutes' }),
    __metadata("design:type", Number)
], Appointment.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'client_notes' }),
    __metadata("design:type", String)
], Appointment.prototype, "clientNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'barber_notes' }),
    __metadata("design:type", String)
], Appointment.prototype, "barberNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'admin_notes' }),
    __metadata("design:type", String)
], Appointment.prototype, "adminNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'confirmed_at' }),
    __metadata("design:type", Date)
], Appointment.prototype, "confirmedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'started_at' }),
    __metadata("design:type", Date)
], Appointment.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'completed_at' }),
    __metadata("design:type", Date)
], Appointment.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'cancelled_at' }),
    __metadata("design:type", Date)
], Appointment.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.clientAppointments),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", user_entity_1.User)
], Appointment.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Appointment.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.barberAppointments),
    (0, typeorm_1.JoinColumn)({ name: 'barber_id' }),
    __metadata("design:type", user_entity_1.User)
], Appointment.prototype, "barber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Appointment.prototype, "barber_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => barbershop_entity_1.Barbershop, (barbershop) => barbershop.appointments),
    (0, typeorm_1.JoinColumn)({ name: 'barbershop_id' }),
    __metadata("design:type", barbershop_entity_1.Barbershop)
], Appointment.prototype, "barbershop", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Appointment.prototype, "barbershop_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Appointment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Appointment.prototype, "updatedAt", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)('appointments')
], Appointment);
//# sourceMappingURL=appointment.entity.js.map