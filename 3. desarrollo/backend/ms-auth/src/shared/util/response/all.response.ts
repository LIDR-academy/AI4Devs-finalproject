import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { GeneralConstant } from 'src/common/constant';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const logger = new Logger(GeneralConstant.AppAbr);

        const isHttp = host.getType() === 'http';
        const isRpc = host.getType() === 'rpc';
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Ha ocurrido un error inesperado';
        let detail: string | string[] = [];
        let errorDetail: any = null;
        let information = {
            type: 'warning',
            action: '',
            message: '',
            resource: '',
            method: '',
        };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();

            if (typeof response === 'object' && response !== null) {
                const responseObj = response as any;

                if ('meta' in responseObj) {
                    if ('error' in responseObj.meta) {
                        const ex = responseObj.meta.error;
                        if (ex && ex.name === 'QueryFailedError') {
                            const pgError = ex.driverError;
                            const errorMappings: { [key: string]: string } = {
                                '23502': 'Los datos enviados no corresponden a esta entidad.',
                                '23505': 'Registro ya existe.',
                                '23503': 'No se puede eliminar, está relacionado.',
                                '22P02': 'Formato de dato inválido.',
                            };

                            const mapped = errorMappings[pgError.code];
                            if (mapped) {
                                information.message = mapped;
                                information.type = 'error';
                                status = HttpStatus.CONFLICT;
                            } else {
                                information.message = 'Error en la base de datos';
                                detail = pgError.detail || pgError.message;
                                information.type = 'error';
                            }
                        } else {
                            information = responseObj.meta.information;
                        }
                    }

                    errorDetail = responseObj.meta.error || null;
                } else if ('message' in responseObj && 'statusCode' in responseObj) {
                    information = {
                        type: 'warning',
                        action: 'validator',
                        message: 'Los datos enviados son incorrectos',
                        resource: 'dto',
                        method: 'ValidationPipe',
                    };

                    errorDetail = Array.isArray(responseObj.message)
                        ? responseObj.message.join(', ')
                        : responseObj.message || responseObj.error || null;
                } else {
                    errorDetail = exception;
                }
            } else {
                detail = exception.message || message;
            }
        } else {
            detail = exception.message || message;
            errorDetail = exception;
        }

        // Log personalizado
        if (errorDetail) {
            logger.error(
                `[${information.type}:${information.action}] [${information.resource}] [${information.method}] - ${information.message}`,
                JSON.stringify(this.serializeError(errorDetail)),
            );
        } else {
            logger.warn(
                `[${information.type}] [${information.action}] [${information.resource}] [${information.method}] - ${information.message}`,
            );
        }

        // Respuesta: HTTP o Microservicio
        if (isHttp) {
            const ctx = host.switchToHttp();
            const res = ctx.getResponse<Response>();
            const req = ctx.getRequest<Request>();

            res.status(status).json({
                data: null,
                meta: {
                    information,
                    pagination: null,
                    status,
                    url: req.url,
                    detail,
                    error: this.serializeError(errorDetail),
                },
            });
        } else if (isRpc) {
            // Respuesta para microservicio (TCP, etc.)
            return {
                data: null,
                meta: {
                    information,
                    pagination: null,
                    status,
                    detail,
                    error: this.serializeError(errorDetail),
                },
            };
        }
    }

    serializeError(error: any) {
        if (!error) return null;
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
            };
        }

        if (typeof error === 'object') {
            return {
                ...error,
                message: error.message ?? '',
            };
        }

        return { message: String(error) };
    }
}