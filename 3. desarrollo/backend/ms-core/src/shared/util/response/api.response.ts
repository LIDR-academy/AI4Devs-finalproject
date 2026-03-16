
import { ParamsInterface } from "../interface";
import { InformationMessage } from "../message";
import { ApiResponse, ApiResponses, InformationMeta, PaginationMeta } from "./api.response.interface";
import { ResponseExceptionUtil } from "./error.response";


export class ResponseUtil {
    static response<T>(data: T, information: InformationMeta, status = 200): ApiResponse<T> {
        return {
            data,
            meta: {
                information: InformationMessage.success(information),
                pagination: null,
                status,
                error: null,
            },
        };
    }

    static responses<T>(data: T[], total: number, params: ParamsInterface, information: InformationMeta, status = 200): ApiResponses<T> {
        const pagination: PaginationMeta = {
            page: params.page,
            pageSize: params.pageSize,
            pageCount: Math.ceil(total / params.pageSize),
            total,
        };
        return {
            data,
            meta: {
                information: InformationMessage.success(information),
                pagination,
                status,
                error: null,
            },
        };
    }

    static detail(information: InformationMeta, status = 200): any {
        const message = InformationMessage.detail(information);
        throw new ResponseExceptionUtil({ ...message, type: 'warning' }, status, null);
    }

    static error(information: InformationMeta, status = 500, error: any = null): any {
        const message = InformationMessage.detail(information);
        message.message = message.message ? message.message : InformationMessage.error(information).message;
        throw new ResponseExceptionUtil({ ...message, type: 'error' }, status, error);
    }

}
