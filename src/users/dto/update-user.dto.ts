import { PartialType } from "@nestjs/swagger";

import { CreateUserDto } from "./create-user.dto";

/**
 * Dto object used when the user is updated.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
