import { Controller, Get, Query } from '@nestjs/common';
import { CuratedService } from './curated.service';
import { GetObrasFilterDto } from './dto/get-obras-filter.dto';

@Controller('obras')
export class CuratedController {
  constructor(private readonly curatedService: CuratedService) {}

  @Get()
  async findAll(@Query() filters: GetObrasFilterDto) {
    return this.curatedService.findAll(filters);
  }
}
