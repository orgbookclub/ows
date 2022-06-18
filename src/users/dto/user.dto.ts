import { ProfileDto } from "./profile.dto";

export class UserDto {
  id: string;
  name: string;

  joinDate: Date;

  profile: ProfileDto;
}
