import { MatTableDataSource } from "@angular/material/table";
import { ApiResponses } from "app/shared/utils";

export interface TblInterface {
    title: string;
    header: {
        column: TblHeaderColumm[];
        buttons?: {
            id: string;
            title: string;
            icon: string;
            color: string;
        }[];
    };
    body: {
        source: MatTableDataSource<any>;
        result: ApiResponses<any>;
    }
    actions: {
        create: boolean;
        update: boolean;
        delete: boolean;
        details: boolean;
        search: boolean;
        buttons: {
            id: string;
            title: string;
            icon: string;
            color: string;
        }[];
    }
}

export interface TblHeaderColumm {
    title: string;
    name: string;
    isImage?: boolean;
    isNumber?: boolean;
    isDate?: boolean;
    isBadge?: boolean;
}


export const TblDefaultInterface: TblInterface = {
    title: '',
    header: {
        column: [],
        buttons: []
    },
    body: {
        source: new MatTableDataSource<any>([]),
        result: {
            data: [],
            meta: {
                pagination: { page: 1, pageSize: 1, pageCount: 1, total: 1 },
                information: undefined,
                status: 0,
                error: undefined
            }
        },
    },
    actions: {
        create: true,
        update: true,
        delete: true,
        details: true,
        search: true,
        buttons: []
    }
}

