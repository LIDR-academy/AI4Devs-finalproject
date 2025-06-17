"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeographyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const region_entity_1 = require("./entities/region.entity");
const city_entity_1 = require("./entities/city.entity");
const barbershop_entity_1 = require("../barbershops/entities/barbershop.entity");
let GeographyService = class GeographyService {
    regionRepository;
    cityRepository;
    barbershopRepository;
    constructor(regionRepository, cityRepository, barbershopRepository) {
        this.regionRepository = regionRepository;
        this.cityRepository = cityRepository;
        this.barbershopRepository = barbershopRepository;
    }
    async getAllRegions() {
        return this.regionRepository.find({
            order: { country: 'ASC', name: 'ASC' },
        });
    }
    async getRegionsByCountry(country) {
        return this.regionRepository.find({
            where: { country },
            order: { name: 'ASC' },
        });
    }
    async getCitiesByRegion(regionId) {
        return this.cityRepository.find({
            where: { region_id: regionId },
            order: { name: 'ASC' },
        });
    }
    async getAllCities() {
        return this.cityRepository.find({
            relations: ['region'],
            order: { name: 'ASC' },
        });
    }
    async getCitiesWithRegions() {
        return this.cityRepository.find({
            relations: ['region'],
            order: {
                region: { country: 'ASC', name: 'ASC' },
                name: 'ASC'
            },
        });
    }
    async getCountries() {
        const result = await this.regionRepository
            .createQueryBuilder('region')
            .select('DISTINCT region.country', 'country')
            .orderBy('region.country', 'ASC')
            .getRawMany();
        return result.map(row => row.country);
    }
    async getActiveBarbershops() {
        try {
            return this.barbershopRepository.find({
                where: { isActive: true },
                relations: ['city'],
                order: { name: 'ASC' },
            });
        }
        catch (error) {
            console.error('Error in getActiveBarbershops:', error);
            return this.barbershopRepository.find({
                where: { isActive: true },
                order: { name: 'ASC' },
            });
        }
    }
    async findCityById(cityId) {
        return this.cityRepository.findOne({
            where: { id: cityId },
            relations: ['region'],
        });
    }
    async findRegionById(regionId) {
        return this.regionRepository.findOne({
            where: { id: regionId },
            relations: ['cities'],
        });
    }
};
exports.GeographyService = GeographyService;
exports.GeographyService = GeographyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __param(1, (0, typeorm_1.InjectRepository)(city_entity_1.City)),
    __param(2, (0, typeorm_1.InjectRepository)(barbershop_entity_1.Barbershop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GeographyService);
//# sourceMappingURL=geography.service.js.map