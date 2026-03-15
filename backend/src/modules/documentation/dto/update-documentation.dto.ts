import { PartialType } from '@nestjs/swagger';
import { CreateDocumentationDto } from './create-documentation.dto';

export class UpdateDocumentationDto extends PartialType(CreateDocumentationDto) {}
