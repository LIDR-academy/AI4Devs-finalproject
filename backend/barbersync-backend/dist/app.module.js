"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_config_1 = require("./config/database.config");
const jwt_config_1 = require("./config/jwt.config");
const app_config_1 = require("./config/app.config");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const geography_module_1 = require("./modules/geography/geography.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const circuit_breaker_module_1 = require("./common/circuit-breaker/circuit-breaker.module");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
const user_entity_1 = require("./modules/users/entities/user.entity");
const barbershop_entity_1 = require("./modules/barbershops/entities/barbershop.entity");
const appointment_entity_1 = require("./modules/appointments/entities/appointment.entity");
const region_entity_1 = require("./modules/geography/entities/region.entity");
const city_entity_1 = require("./modules/geography/entities/city.entity");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(logger_middleware_1.LoggerMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default, jwt_config_1.default, app_config_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => configService.get('database'),
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, barbershop_entity_1.Barbershop, appointment_entity_1.Appointment, region_entity_1.Region, city_entity_1.City]),
            circuit_breaker_module_1.CircuitBreakerModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            geography_module_1.GeographyModule,
            appointments_module_1.AppointmentsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map