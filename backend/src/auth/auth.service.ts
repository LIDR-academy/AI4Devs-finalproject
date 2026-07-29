import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async devLogin(email: string) {
    const user = await this.usersService.findOrCreateByEmail(email);
    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    return { access_token, user: { id: user.id, email: user.email } };
  }
}
