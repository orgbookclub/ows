import { ProfileDto } from './profile.dto';

export class UserDto {
  userId: number;

  name: string;

  joinDate: Date;

  profile: ProfileDto;
}
