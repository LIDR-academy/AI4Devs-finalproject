
import { Module } from '@nestjs/common';
import { OpcioModule } from './opcio/module';
import { ToficModule } from './tofic/module';
import { PerfiModule } from './perfi/module';
import { ColorModule } from './color/module';
import { IconsModule } from './icons/module';

const submodule = [
  OpcioModule, // Opciones del sistema
  ToficModule,  // Tipo de oficina
  PerfiModule, // Perfil de acceso
  ColorModule, // Colores
  IconsModule, // Iconos

];

@Module({
  imports: submodule,
  exports: submodule,
})
export class ParameterModule { }
