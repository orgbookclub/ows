import { ProfileDto } from "./profile.dto";

/**
 * Dto object for storing user information.
 */
export class UserDto {
  userId: number;

  name: string;

  joinDate: Date;

  profile: ProfileDto;
}
