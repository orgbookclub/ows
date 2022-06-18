import { Test, TestingModule } from '@nestjs/testing';
import { MockRepository } from '../repositories/mock.repository';
import { UserRepository } from '../repositories/user.repository';
import { mockUser, mockUserDocs } from '../utils/mockUserValues';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useValue: new MockRepository<User>(mockUserDocs),
        },
        UsersService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user = mockUser('newUserId', 'newUser');
      const actual = await service.create(user);
      expect(actual).toEqual({ _id: 'mock random uuid', ...user });
    });

    it('should throw an error if user already exists', async () => {
      await expect(service.create(mockUser())).rejects.toThrow(
        'User already exists!',
      );
    });
  });
});
