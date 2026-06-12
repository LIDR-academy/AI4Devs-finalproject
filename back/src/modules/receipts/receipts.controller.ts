import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ConfirmReceiptItemsDto } from "./dto/confirm-receipt-items.dto";
import { ReceiptsService } from "./receipts.service";

interface UploadedReceiptFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@Controller("receipts")
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  upload(
    @Request() req: RequestWithUser,
    @UploadedFile() file: UploadedReceiptFile | undefined,
  ) {
    return this.receiptsService.uploadAndProcess(req.user.id, file);
  }

  @Get(":id")
  getById(@Request() req: RequestWithUser, @Param("id") id: string) {
    return this.receiptsService.getById(req.user.id, id);
  }

  @Get(":id/status")
  getStatus(@Request() req: RequestWithUser, @Param("id") id: string) {
    return this.receiptsService.getStatus(req.user.id, id);
  }

  @Post(":id/confirm-items")
  confirmItems(
    @Request() req: RequestWithUser,
    @Param("id") id: string,
    @Body() body: ConfirmReceiptItemsDto,
  ) {
    return this.receiptsService.confirmItems(req.user.id, id, body);
  }
}
