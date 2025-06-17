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
exports.Barbershop = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const appointment_entity_1 = require("../../appointments/entities/appointment.entity");
const city_entity_1 = require("../../geography/entities/city.entity");
let Barbershop = class Barbershop {
    id;
    name;
    description;
    address;
    city_id;
    neighborhood;
    owner_name;
    phone;
    email;
    openTime;
    closeTime;
    workingDays;
    timezone;
    isActive;
    logo;
    website;
    socialMedia;
    city;
    users;
    appointments;
    createdAt;
    updatedAt;
};
exports.Barbershop = Barbershop;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Barbershop.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Barbershop.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Barbershop.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Barbershop.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'city_id', nullable: true }),
    __metadata("design:type", Object)
], Barbershop.prototype, "city_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Barbershop.prototype, "neighborhood", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'owner_name', nullable: true }),
    __metadata("design:type", Object)
], Barbershop.prototype, "owner_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Barbershop.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Barbershop.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'open_time', type: 'time', default: '09:00:00' }),
    __metadata("design:type", String)
], Barbershop.prototype, "openTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'close_time', type: 'time', default: '18:00:00' }),
    __metadata("design:type", String)
], Barbershop.prototype, "closeTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'working_days', type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Barbershop.prototype, "workingDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'timezone', nullable: true }),
    __metadata("design:type", String)
], Barbershop.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Barbershop.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Barbershop.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Barbershop.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'social_media', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Barbershop.prototype, "socialMedia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => city_entity_1.City, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'city_id' }),
    __metadata("design:type", city_entity_1.City)
], Barbershop.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.barbershop),
    __metadata("design:type", Array)
], Barbershop.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => appointment_entity_1.Appointment, (appointment) => appointment.barbershop),
    __metadata("design:type", Array)
], Barbershop.prototype, "appointments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Barbershop.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Barbershop.prototype, "updatedAt", void 0);
exports.Barbershop = Barbershop = __decorate([
    (0, typeorm_1.Entity)('barbershops')
], Barbershop);
//# sourceMappingURL=barbershop.entity.js.map