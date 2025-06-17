import { Region } from './region.entity';
export declare class City {
    id: string;
    name: string;
    region_id: string;
    created_at: Date;
    updated_at: Date;
    region: Region;
}
