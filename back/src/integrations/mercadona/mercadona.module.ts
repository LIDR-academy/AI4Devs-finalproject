import { Module } from "@nestjs/common";
import { MercadonaService } from "./mercadona.service";

@Module({
  providers: [MercadonaService],
  exports: [MercadonaService],
})
export class MercadonaModule {}
