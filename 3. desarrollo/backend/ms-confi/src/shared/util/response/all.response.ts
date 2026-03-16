import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { envs } from 'src/common';
import { GeneralConstant } from 'src/common/config/constant';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const logger = new Logger(GeneralConstant.appAbr);

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
                    detail: detail = envs.nodeEnv === 'production' ? [] : detail,
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
                    detail: detail = envs.nodeEnv === 'production' ? [] : detail,
                    error: this.serializeError(errorDetail),
                },
            };
        }
    }

    serializeError(error: any) {
        if (envs.nodeEnv === 'production') {
            return null;
        }
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