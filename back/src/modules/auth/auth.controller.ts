import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { UpdateProfileDto } from "../users/dto/update-profile.dto";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthService } from "./auth.service";

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() body: AuthCredentialsDto) {
    return this.authService.register(body);
  }

  @Post("login")
  login(@Body() body: AuthCredentialsDto) {
    return this.authService.login(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Request() req: RequestWithUser) {
    return this.authService.me(req.user.id);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  updateMe(@Request() req: RequestWithUser, @Body() body: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Patch("me/password")
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  changePassword(@Request() req: RequestWithUser, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, body);
  }

  @Delete("me")
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  deleteMe(@Request() req: RequestWithUser) {
    return this.authService.deleteAccount(req.user.id);
  }
}
