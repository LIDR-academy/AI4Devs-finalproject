import { GeographyService } from './geography.service';
import { Region } from './entities/region.entity';
import { City } from './entities/city.entity';
export declare class GeographyController {
    private readonly geographyService;
    constructor(geographyService: GeographyService);
    getCountries(): Promise<{
        countries: string[];
    }>;
    getRegions(country?: string): Promise<{
        regions: Region[];
    }>;
    getCities(regionId?: string): Promise<{
        cities: City[];
    }>;
    getBarbershops(): Promise<{
        barbershops: any[];
    }>;
    getRegionById(id: string): Promise<{
        region: Region | null;
    }>;
    getCityById(id: string): Promise<{
        city: City | null;
    }>;
}
