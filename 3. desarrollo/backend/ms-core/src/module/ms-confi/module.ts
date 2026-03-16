import { Module } from '@nestjs/common';
import { ParameterModule } from "./parameter/module";
import { ManagementModule } from './management/module';


const modules = [
    ManagementModule,
    ParameterModule,
];

@Module({
    imports: modules,
    exports: modules
})
export class MsConfigModule { }
