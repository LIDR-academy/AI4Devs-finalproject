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
exports.GeographyController = void 0;
const common_1 = require("@nestjs/common");
const geography_service_1 = require("./geography.service");
let GeographyController = class GeographyController {
    geographyService;
    constructor(geographyService) {
        this.geographyService = geographyService;
    }
    async getCountries() {
        const countries = await this.geographyService.getCountries();
        return { countries };
    }
    async getRegions(country) {
        let regions;
        if (country) {
            regions = await this.geographyService.getRegionsByCountry(country);
        }
        else {
            regions = await this.geographyService.getAllRegions();
        }
        return { regions };
    }
    async getCities(regionId) {
        let cities;
        if (regionId) {
            cities = await this.geographyService.getCitiesByRegion(regionId);
        }
        else {
            cities = await this.geographyService.getCitiesWithRegions();
        }
        return { cities };
    }
    async getBarbershops() {
        const barbershops = await this.geographyService.getActiveBarbershops();
        return { barbershops };
    }
    async getRegionById(id) {
        const region = await this.geographyService.findRegionById(id);
        return { region };
    }
    async getCityById(id) {
        const city = await this.geographyService.findCityById(id);
        return { city };
    }
};
exports.GeographyController = GeographyController;
__decorate([
    (0, common_1.Get)('countries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GeographyController.prototype, "getCountries", null);
__decorate([
    (0, common_1.Get)('regions'),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeographyController.prototype, "getRegions", null);
__decorate([
    (0, common_1.Get)('cities'),
    __param(0, (0, common_1.Query)('regionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeographyController.prototype, "getCities", null);
__decorate([
    (0, common_1.Get)('barbershops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GeographyController.prototype, "getBarbershops", null);
__decorate([
    (0, common_1.Get)('regions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeographyController.prototype, "getRegionById", null);
__decorate([
    (0, common_1.Get)('cities/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeographyController.prototype, "getCityById", null);
exports.GeographyController = GeographyController = __decorate([
    (0, common_1.Controller)('geography'),
    __metadata("design:paramtypes", [geography_service_1.GeographyService])
], GeographyController);
//# sourceMappingURL=geography.controller.js.map