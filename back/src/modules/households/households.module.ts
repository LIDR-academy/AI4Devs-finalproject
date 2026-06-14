import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { HouseholdsController } from "./households.controller";
import { HouseholdsService } from "./households.service";
import { InvitationsController } from "./invitations.controller";

@Module({
  imports: [UsersModule],
  controllers: [HouseholdsController, InvitationsController],
  providers: [HouseholdsService],
  exports: [HouseholdsService],
})
export class HouseholdsModule {}
