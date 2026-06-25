import { Module } from "@nestjs/common";
import { ThemealdbService } from "./themealdb.service";

@Module({
  providers: [ThemealdbService],
  exports: [ThemealdbService],
})
export class ThemealdbModule {}
