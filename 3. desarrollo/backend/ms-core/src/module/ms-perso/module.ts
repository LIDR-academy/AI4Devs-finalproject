import { Module } from '@nestjs/common';
import { ParameterModule } from "./parameter/parameter.module";
import { HealthModule } from "./health/health.module";

const modules = [
    ParameterModule,
    HealthModule
];

@Module({
    imports: modules,
    exports: modules
})
export class MsPersoModule { }
