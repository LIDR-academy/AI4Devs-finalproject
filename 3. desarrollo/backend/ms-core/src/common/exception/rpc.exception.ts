
import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';


@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter<RpcException> {
    catch(exception: RpcException, host: ArgumentsHost) {

        const context = host.switchToHttp();
        const response = context.getResponse();
        const rpcError = exception.getError();

        const status = (typeof rpcError === "object" && rpcError !== null && "status" in rpcError)
            ? (rpcError as any).status ?? 400
            : 400;
        const information = `[RPC] No se pudo establecer comunicación con el servicio remoto [${response.req.url}]. Por favor, intente nuevamente o contacte al soporte si el problema persiste.`;
        const detail = (typeof rpcError === "object" && rpcError !== null && "message" in rpcError)
            ? (rpcError as any).message : "No se pudo procesar la solicitud";

        // Si rpcError es un objeto, lo serializamos
        const errorDetail = typeof rpcError === "object" ? JSON.stringify(rpcError) : rpcError;

        // Estructura de la respuesta
        const errorResponse = {
            data: null,
            meta: {
                information,
                pagination: null,
                status,
                url: response.req.url,
                detail,
                error: errorDetail, // Error serializado solo si es necesario
            },
        };

        return response.status(status).json(errorResponse);
    }
}
