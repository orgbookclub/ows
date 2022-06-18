import { ProfileDto } from '../users/dto/profile.dto';
import { User } from '../users/schemas/user.schema';

export const mockUser = (
  id = 'uniqueId',
  name = 'username',
  joinDate = new Date(),
  profile = new ProfileDto(),
): User => ({
  id: id,
  name: name,
  joinDate: joinDate,
  profile: profile,
});

export const mockUsers = [
  mockUser(),
  mockUser('uniqueId#2', 'username#2'),
  mockUser('uniqueId#3', 'username#3'),
];

export const mockUserDocs = [
  { _id: 'uuid', ...mockUsers[0] },
  { _id: 'uuid2', ...mockUsers[1] },
  { _id: 'uuid3', ...mockUsers[2] },
];
