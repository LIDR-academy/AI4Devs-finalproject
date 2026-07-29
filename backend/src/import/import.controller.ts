import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/request-with-user';
import type { GenreResolutionMap } from '../genres/genre-resolution.types';
import { ImportService } from './import.service';
import type { UploadedCsvFile } from './import.types';

@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('goodreads/preview')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  previewGoodreadsCsv(
    @Req() req: RequestWithUser,
    @UploadedFile() file: UploadedCsvFile | undefined,
  ) {
    return this.importService.previewGoodreadsUpload(req.user.userId, file);
  }

  @Post('goodreads')
  @HttpCode(202)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  parseGoodreadsCsv(
    @Req() req: RequestWithUser,
    @UploadedFile() file: UploadedCsvFile | undefined,
    @Body('genre_resolutions') genreResolutionsRaw?: string,
  ) {
    const genreResolutions = this.parseGenreResolutions(genreResolutionsRaw);
    return this.importService.importGoodreadsUpload(
      req.user.userId,
      file,
      genreResolutions,
    );
  }

  private parseGenreResolutions(
    raw: string | undefined,
  ): GenreResolutionMap | undefined {
    if (!raw?.trim()) {
      return undefined;
    }

    try {
      return JSON.parse(raw) as GenreResolutionMap;
    } catch {
      return undefined;
    }
  }

  @Get('jobs/:jobId')
  getImportJob(
    @Req() req: RequestWithUser,
    @Param('jobId') jobId: string,
  ) {
    return this.importService.getImportJob(req.user.userId, jobId);
  }

  @Post('reenrich-pending')
  @HttpCode(200)
  reenrichPending(@Req() req: RequestWithUser) {
    return this.importService.reenrichPendingBooks(req.user.userId);
  }
}
