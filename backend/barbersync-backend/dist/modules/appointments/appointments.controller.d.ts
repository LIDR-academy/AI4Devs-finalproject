import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { Request } from 'express';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(createAppointmentDto: CreateAppointmentDto, req: Request): Promise<{
        message: string;
        appointment: import("./entities/appointment.entity").Appointment;
    }>;
    findAll(query: GetAppointmentsDto): Promise<{
        message: string;
        data: import("./entities/appointment.entity").Appointment[];
        meta: {
            total: number;
            totalPages: number;
            currentPage: number;
            limit: number;
        };
    }>;
    getMyAppointments(req: Request, query: GetAppointmentsDto): Promise<{
        message: string;
        data: import("./entities/appointment.entity").Appointment[];
        meta: {
            total: number;
            totalPages: number;
            currentPage: number;
            limit: number;
        };
    }>;
    getAvailableSlots(barberId: string, date: string, duration?: string): Promise<{
        message: string;
        date: string;
        barberId: string;
        availableSlots: string[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        appointment: import("./entities/appointment.entity").Appointment;
    }>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto, req: Request): Promise<{
        message: string;
        appointment: import("./entities/appointment.entity").Appointment;
    }>;
    cancel(id: string, req: Request): Promise<{
        message: string;
        appointment: import("./entities/appointment.entity").Appointment;
    }>;
    confirm(id: string): Promise<{
        message: string;
        appointment: import("./entities/appointment.entity").Appointment;
    }>;
    complete(id: string): Promise<{
        message: string;
        appointment: import("./entities/appointment.entity").Appointment;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
