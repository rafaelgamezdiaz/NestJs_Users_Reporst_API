import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { NotFoundException } from '@nestjs/common';



describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {

    fakeUsersService = {
      findByEmail: (email: string) => {
        return Promise.resolve({ id: 1, email, password: '1231qs' } as User);
      },
      findAll: () => {
        return Promise.resolve([{ id: 1, email: 'email1@mail.com', password: '1231qs' }, { id: 2, email: 'email2@mail.com', password: 'ewefsdfs4' }] as User[]);
      },
      findOne: (id: number) => {
        return Promise.resolve({ id: 23, email: 'hello@mail.com', password: '1231qs' } as User);
      },
      remove: (id: number) => {
        return Promise.resolve({ id, email: 'hello@mail.com', password: '1231qs' } as User);
      },
      update: (id: number) => {
        return Promise.resolve({ id, email: 'hellox@mail.com', password: '1231qs' } as User);
      }
    };
    fakeAuthService = {
      signup: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email } as User);
      },
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      }
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],

    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a user by email', async () => {
    const user = await controller.findUserByEmail('myemail@mail.com');
    expect(user).toBeDefined();
  });

  it('findAllUsers should return an array of users', async () => {
    const users = await controller.findAllUsers();
    expect(users).toBeDefined();
    expect(users.length).toEqual(2);
    expect(users[0].email).toEqual('email1@mail.com');
  });

  it('findUser should return a user by correct id', async () => {
    const user = await controller.findUser('23');
    expect(user).toBeDefined();
  });

  it('findUser should return a user by wrong id', async () => {
    // **Sobrescribe el mock findOne SÓLO para este test**
    // Haz que findOne devuelva null o undefined para simular que no se encontró el usuario
    fakeUsersService.findOne = (id: number) => {
      return Promise.resolve(null);
    };

    // Attempt to get user with wrong id
    await expect(controller.findUser('14')).rejects.toThrow(
      NotFoundException
    );

  });

  it('signins update session object and return user', async () => {

    const session = { userId: -10 };
    const user = await controller.login({ email: 'emai1@mail.com', password: '1231qs' }, session);

    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  }
  );
});
