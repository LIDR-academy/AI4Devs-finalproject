import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { User } from '../users/entities/user.entity';
import { Barbershop } from '../barbershops/entities/barbershop.entity';
export declare class AppointmentsService {
    private appointmentRepository;
    private userRepository;
    private barbershopRepository;
    constructor(appointmentRepository: Repository<Appointment>, userRepository: Repository<User>, barbershopRepository: Repository<Barbershop>);
    create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment>;
    findAll(query: GetAppointmentsDto): Promise<{
        appointments: Appointment[];
        total: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Appointment>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto, userId?: string): Promise<Appointment>;
    cancel(id: string, userId?: string): Promise<Appointment>;
    complete(id: string): Promise<Appointment>;
    confirm(id: string): Promise<Appointment>;
    remove(id: string): Promise<void>;
    getAvailableTimeSlots(barberId: string, date: string, duration?: number): Promise<string[]>;
    private validateTimeSlotAvailability;
    private validateBarbershopWorkingHours;
    private timeToMinutes;
    private generateWorkingHours;
    private filterAvailableSlots;
}
