import { CreateAppointmentDto } from './create-appointment.dto';
import { AppointmentStatus } from '../../../common/enums/appointment-status.enum';
declare const UpdateAppointmentDto_base: import("@nestjs/common").Type<Partial<CreateAppointmentDto>>;
export declare class UpdateAppointmentDto extends UpdateAppointmentDto_base {
    status?: AppointmentStatus;
}
export {};
