import { AppointmentStatus } from '../../../common/enums/appointment-status.enum';
export declare class CreateAppointmentDto {
    client_id: string;
    barber_id: string;
    barbershop_id: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    notes?: string;
    price?: string;
    serviceDescription?: string;
    status?: AppointmentStatus;
}
