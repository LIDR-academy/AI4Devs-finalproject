import { CrudAction } from "../response";

export interface InformationOption {
    action: CrudAction;
    resource: string;
    method: string;
    message?: string;
}



