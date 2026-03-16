"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeographyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const geography_controller_1 = require("./geography.controller");
const geography_service_1 = require("./geography.service");
const region_entity_1 = require("./entities/region.entity");
const city_entity_1 = require("./entities/city.entity");
const barbershop_entity_1 = require("../barbershops/entities/barbershop.entity");
let GeographyModule = class GeographyModule {
};
exports.GeographyModule = GeographyModule;
exports.GeographyModule = GeographyModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([region_entity_1.Region, city_entity_1.City, barbershop_entity_1.Barbershop])],
        controllers: [geography_controller_1.GeographyController],
        providers: [geography_service_1.GeographyService],
        exports: [geography_service_1.GeographyService],
    })
], GeographyModule);
//# sourceMappingURL=geography.module.js.map