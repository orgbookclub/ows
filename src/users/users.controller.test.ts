import { Test, TestingModule } from '@nestjs/testing';
import { MockRepository } from '../repositories/mock.repository';
import { UserRepository } from '../repositories/user.repository';
import { mockUser, mockUserDocs, mockUsers } from '../utils/mockUserValues';
import { User } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserRepository,
          useValue: new MockRepository<User>(mockUserDocs),
        },
        UsersService,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user = mockUser(23, 'newUser');
      const actual = await controller.create(user);
      expect(actual).toEqual({ _id: 'mock random uuid', ...user });
    });

    it('should throw an exception if user already exists', async () => {
      await expect(controller.create(mockUsers[0])).rejects.toThrow(
        'User already exists!',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const actual = await controller.findAll();
      expect(actual).toEqual(mockUserDocs);
    });
  });

  describe('findOneByUserId', () => {
    it('should return a user', async () => {
      const actual = await controller.findOneByUserId(mockUserDocs[0].userId);
      expect(actual).toEqual(mockUserDocs[0]);
    });

    it('should return null if not found', async () => {
      const actual = await controller.findOneByUserId(99);
      expect(actual).toBeNull();
    });
  });

  describe('update', () => {
    it('should update the name of the user', async () => {
      await controller.update(mockUserDocs[0]._id, {
        name: 'updated username',
      });
      const updatedUser = await controller.findOneByUserId(
        mockUserDocs[0].userId,
      );
      expect(updatedUser.name).toEqual('updated username');
    });
  });

  describe('remove', () => {
    it('should delete the user', async () => {
      const id = mockUserDocs[1].userId;
      await controller.remove(mockUserDocs[1]._id);
      const user = await controller.findOneByUserId(id);
      expect(user).toBeNull();
    });
  });
});
