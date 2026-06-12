import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
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
}
