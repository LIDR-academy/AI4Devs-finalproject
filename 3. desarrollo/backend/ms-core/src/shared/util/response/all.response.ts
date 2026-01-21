import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { GeneralConstant } from 'src/constant';
import { InformationMeta } from 'src/shared/util/response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const logger = new Logger(GeneralConstant.appAbr);
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string = 'Ha ocurrido un error inesperado';
        let detail: string | string[] = [];
        let errorDetail: any = null;
        let information: InformationMeta = {
            type: 'warning',
            action: '',
            message: '',
            resource: '',
            method: ''
        }

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();
            if (typeof response === 'object' && response !== null) {
                const responseObj = response as any;
                if ('meta' in responseObj) {

                    if ('error' in responseObj['meta']) {
                        const exception = responseObj['meta'].error;
                        if (exception && exception.name && exception.name === 'QueryFailedError') {
                            const pgError = exception.driverError;
                            // Mapeo de códigos de error específicos de Postgres
                            const errorMappings: { [key: string]: string } = {
                                '23502': 'Los datos enviados, no corresponden a esta entidad.',
                                '23505': 'No se puede crear, porque el presente registro ya se encuentra registrado.',
                                '23503': 'No se puede eliminar, porque está conectado con otra tabla.',
                                '22P02': 'El dato enviado, no contiene el formato esperado, por favor revise la información enviada.',
                                // Agrega más códigos si es necesario
                            };

                            const detailFromCode = errorMappings[pgError.code];

                            if (detailFromCode) {
                                information.message = detailFromCode;
                                information.type = 'error';
                                status = HttpStatus.CONFLICT;
                            } else {
                                // Si no se encuentra un código mapeado, mostrar el mensaje original
                                information.message = 'Error en la base de datos';
                                detail = pgError.detail || pgError.message;
                                information.type = 'error';
                            }
                        } else information = responseObj.meta.information;
                    }
                    errorDetail = responseObj.meta.error || null;
                } else if (responseObj && 'message' in responseObj && 'statusCode' in responseObj) {
                    console.log(`Error en response: ${JSON.stringify(responseObj)}`);
                    const uiErrorMessages: { [key: number]: string } = {
                        400: 'Los datos enviados son incorrectos. Por favor verifica la información.',
                        401: 'Tu sesión ha expirado o no tienes permisos. Vuelve a iniciar sesión.',
                        403: 'No tienes permisos para acceder a este recurso.',
                        404: 'El recurso solicitado no fue encontrado.',
                        409: 'Conflicto en los datos enviados. Intenta nuevamente.',
                        422: 'Algunos campos no cumplen con las validaciones.',
                        500: 'Ocurrió un error interno en el servidor. Intenta más tarde.'
                    };

                    const statusCode = responseObj.statusCode;
                    const friendlyMessage =
                        uiErrorMessages[statusCode] ||
                        (typeof responseObj.message === 'string'
                            ? responseObj.message
                            : 'Ocurrió un error inesperado');

                    information = {
                        type: 'warning',
                        action: 'validator',
                        message: friendlyMessage,
                        resource: 'dto',
                        method: 'ValidationPipe'
                    };
                    errorDetail = Array.isArray(responseObj.message)
                        ? responseObj.message.join(', ')
                        : responseObj.message || responseObj.error || null;
                }

                else errorDetail = exception;
            } else detail = exception.message || message;
        } else {
            detail = exception.message || message;
            errorDetail = exception;
        }

        if (errorDetail) {
            logger.error(
                `[${information.type}:${information.action}] [${information.resource}] [${information.method}] - ${information.message}`,
                JSON.stringify(this.serializeError(errorDetail)),
                `Url: [${res.req.url}]`
            );
        } else {
            logger.warn(
                `[${information.type}] [${information.action}] [${information.resource}] [${information.method}] - ${information.message}`,
                `URL: ${res.req.url}`
            );
        }

        res.status(status).json({
            data: null,
            meta: {
                information,
                pagination: null,
                status,
                url: res.req.url,
                detail,
                error: this.serializeError(errorDetail),
            },
        });
    }

    serializeError(error: any) {
        if (!error) return null;

        // Si ya es un error nativo o de tipo Error
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
            };
        }

        // Si es un objeto plano
        if (typeof error === 'object') {
            return {
                ...error,
                message: error.message ?? '',
            };
        }

        // Por defecto, devolver texto plano
        return { message: String(error) };
    }



}
