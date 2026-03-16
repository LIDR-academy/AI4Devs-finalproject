import { AppointmentStatus } from '../../../common/enums/appointment-status.enum';
export declare class GetAppointmentsDto {
    barber_id?: string;
    client_id?: string;
    barbershop_id?: string;
    startDate?: string;
    endDate?: string;
    status?: AppointmentStatus;
    page?: number;
    limit?: number;
}
