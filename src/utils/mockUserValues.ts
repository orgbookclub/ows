import { ProfileDto } from '../users/dto/profile.dto';
import { User } from '../users/schemas/user.schema';

const mockProfile = (bio = 'mock bio'): ProfileDto => ({
  bio: bio,
});

export const mockUser = (
  id = 'uniqueId',
  name = 'username',
  profile = mockProfile(),
  joinDate = new Date(),
): User => ({
  id: id,
  name: name,
  profile: profile,
  joinDate: joinDate,
});

export const mockUsers = [
  mockUser(),
  mockUser('uniqueId#2', 'username#2', mockProfile('mockBio#2')),
  mockUser('uniqueId#3', 'username#3', mockProfile('mockBio#3')),
];

export const mockUserDocs = [
  { _id: 'uuid', ...mockUsers[0] },
  { _id: 'uuid2', ...mockUsers[1] },
  { _id: 'uuid3', ...mockUsers[2] },
];
