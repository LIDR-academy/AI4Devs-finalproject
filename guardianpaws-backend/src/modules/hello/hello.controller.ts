import { Controller, Get } from '@nestjs/common';

@Controller('hello')
export class HelloController {
  @Get()
  getHello(): { message: string } {
    return { message: 'Hola Mundo' };
  }
} 