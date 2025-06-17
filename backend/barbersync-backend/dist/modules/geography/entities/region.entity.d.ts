import { City } from './city.entity';
export declare class Region {
    id: string;
    name: string;
    country: string;
    created_at: Date;
    updated_at: Date;
    cities: City[];
}
