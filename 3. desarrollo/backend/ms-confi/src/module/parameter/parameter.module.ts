
import { Module } from '@nestjs/common';
import { PerfiModule } from './perfi/interface/module';
import { ColorModule } from './color/interface/module';
import { IconsModule } from './icons/interface/module';
import { OpcioModule } from './opcio/interface/module';
import { ToficModule } from './tofic/interface/module';
import { GeoModule } from './geo/interface/module';
import { CiiuModule } from './ciiu/interface/module';

const submodule = [
  ColorModule,
  IconsModule,
  PerfiModule,
  OpcioModule,
  ToficModule,
  GeoModule,
  CiiuModule
];

@Module({
  imports: submodule,
  exports: submodule,
})
export class ParameterModule { }
