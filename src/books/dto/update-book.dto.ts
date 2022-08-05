import { PartialType } from "@nestjs/swagger";

import { CreateBookDto } from "./create-book.dto";

/**
 * Dto object used when a book is updated.
 */
export class UpdateBookDto extends PartialType(CreateBookDto) {}
