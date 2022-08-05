import { ProfileDto } from "../users/dto/profile.dto";
import { UserDto } from "../users/dto/user.dto";

const mockProfile = (bio = "mock bio"): ProfileDto => ({
  bio: bio,
});

/**
 * Creates a mock user object.
 *
 * @param {number} userId The user Id.
 * @param {string} name The user name.
 * @param {ProfileDto} profile The profile Dto object.
 * @param {Date} joinDate The joining date of the user.
 * @returns {UserDto} The userDto object.
 */
export const mockUser = (
  userId = 1,
  name = "username",
  profile = mockProfile(),
  joinDate = new Date(),
): UserDto => ({
  userId: userId,
  name: name,
  profile: profile,
  joinDate: joinDate,
});

export const mockUsers = [
  mockUser(),
  mockUser(2, "username#2", mockProfile("mockBio#2")),
  mockUser(3, "username#3", mockProfile("mockBio#3")),
];

export const mockUserDocs = [
  { _id: "uuid", ...mockUsers[0] },
  { _id: "uuid2", ...mockUsers[1] },
  { _id: "uuid3", ...mockUsers[2] },
];
