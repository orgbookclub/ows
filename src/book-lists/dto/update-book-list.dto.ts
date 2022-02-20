import { PartialType } from '@nestjs/swagger';
import { CreateBookListDto } from './create-book-list.dto';

export class UpdateBookListDto extends PartialType(CreateBookListDto) {}
