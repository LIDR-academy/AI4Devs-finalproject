import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddWatchlistDto } from './dto/add-watchlist.dto';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async addToWatchlist(@Request() req: any, @Body() addWatchlistDto: AddWatchlistDto) {
    return this.userService.addToWatchlist(req.user.id, addWatchlistDto.id_obra);
  }

  @Get()
  async getWatchlist(@Request() req: any) {
    return this.userService.getWatchlist(req.user.id);
  }
}
