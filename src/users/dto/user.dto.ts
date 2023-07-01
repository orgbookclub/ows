import { ProfileDto } from "./profile.dto";

/**
 * Dto object for storing user information.
 */
export class UserDto {
  /**
   * The unique ID for the user.
   */
  userId: string;

  /**
   * The username.
   */
  name: string;

  /**
   * The joining date for the user.
   */
  joinDate: Date;

  /**
   * The profile information fot the user.
   */
  profile: ProfileDto;
}
