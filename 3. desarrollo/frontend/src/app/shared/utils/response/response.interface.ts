
export interface ResponseEntity {
    meta: {
        information: InformationMeta;
        pagination: PaginationMeta | null;
        status: number;
        error: any;
    };
}

export interface PaginationMeta {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
}

export type CrudAction = | 'create' | 'update' | 'delete' | 'get' | 'list' | 'validator' | 'signIn' | 'signOut'
    | 'primary'
    | 'accent'
    | 'warn'
    | 'basic'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';
export type TypeAction = | 'successful' | 'warning' | 'error';
export interface InformationMeta {
    type: CrudAction;
    action: CrudAction;
    message: string;
    resource: string;
    method: string;
}

export interface ApiResponses<T> extends ResponseEntity { data: T[] }

export interface ApiResponse<T> extends ResponseEntity { data: T }
