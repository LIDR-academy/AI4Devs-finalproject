import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from './config/database.config';
import { HelloModule } from './modules/hello/hello.module';
// Importar otros módulos aquí
// import { AdoptionModule } from './modules/adoption/adoption.module';
// import { AuthModule } from './modules/auth/auth.module';
// import { ChatModule } from './modules/chat/chat.module';
// import { ImageModule } from './modules/image/image.module';
// import { PetModule } from './modules/pet/pet.module';
// import { ReportModule } from './modules/report/report.module';
// import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    // AdoptionModule,
    // AuthModule,
    // ChatModule,
    // ImageModule,
    // PetModule,
    // ReportModule,
    // UserModule,
    HelloModule,
  ],
})
export class AppModule {}