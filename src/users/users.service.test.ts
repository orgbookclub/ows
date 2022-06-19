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

  describe('findAll', () => {
    it('should return the list of all users', async () => {
      const actual = await service.findAll();
      expect(actual).toEqual(mockUserDocs);
    });
  });

  describe('findOne', () => {
    it('should return one user', async () => {
      const actual = await service.findOne(mockUserDocs[0]._id);
      expect(actual).toEqual(mockUserDocs[0]);
    });

    it('should return null if no user found', async () => {
      const actual = await service.findOne('random id');
      expect(actual).toBeNull();
    });
  });

  describe('update', () => {
    it('should update the name of the user', async () => {
      await service.update(mockUserDocs[0]._id, { name: 'updated username' });
      const updatedUser = await service.findOne(mockUserDocs[0]._id);
      expect(updatedUser.name).toEqual('updated username');
    });
  });

  describe('remove', () => {
    it('should delete the user', async () => {
      const id = mockUserDocs[1]._id;
      await service.remove(mockUserDocs[1]._id);
      const user = await service.findOne(id);
      expect(user).toBeNull();
    });
  });
});
