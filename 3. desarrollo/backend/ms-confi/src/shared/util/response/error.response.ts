
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse, InformationMeta } from './api.response.interface';


export class ResponseExceptionUtil extends HttpException {
    constructor(information: InformationMeta, status: number = HttpStatus.INTERNAL_SERVER_ERROR, error: any = null) {
        const response: ApiResponse<null> = {
            data: null,
            meta: {
                information: {
                    ...information,
                    message: '!Upps..! ' + information.message
                },
                pagination: null,
                status,
                error,
            },
        };
        super(response, status);
    }
}
