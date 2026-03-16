import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { City } from './entities/city.entity';
import { Barbershop } from '../barbershops/entities/barbershop.entity';
export declare class GeographyService {
    private regionRepository;
    private cityRepository;
    private barbershopRepository;
    constructor(regionRepository: Repository<Region>, cityRepository: Repository<City>, barbershopRepository: Repository<Barbershop>);
    getAllRegions(): Promise<Region[]>;
    getRegionsByCountry(country: string): Promise<Region[]>;
    getCitiesByRegion(regionId: string): Promise<City[]>;
    getAllCities(): Promise<City[]>;
    getCitiesWithRegions(): Promise<City[]>;
    getCountries(): Promise<string[]>;
    getActiveBarbershops(): Promise<Barbershop[]>;
    findCityById(cityId: string): Promise<City | null>;
    findRegionById(regionId: string): Promise<Region | null>;
}
