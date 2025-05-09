import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./users.entity";
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);


describe('AuthService', () => {
    let service: AuthService;
    let fakeUserService: Partial<UsersService>;

    beforeEach(async () => {
        // Create a fake copy of UserService
        const users: User[] = [];
        fakeUserService = {
            findByEmail: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers[0]);
            },
            create: (email: string, password: string) => {
                const user = { id: Math.floor(Math.random() * 99999), email, password } as User;
                users.push(user);
                return Promise.resolve(user);
            },
        }

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUserService,
                }
            ]
        }).compile();

        service = module.get(AuthService);
    });

    it('can create an instance of AuthService', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('newemail@gmail.com', 'mypassword');

        expect(user.password).not.toEqual('mypassword');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();

    });

    it('throws an error if user signs up with email that is in use', async () => {

        // fakeUserService.findByEmail = (email: string) =>
        //     Promise.resolve({ id: 1, email, password: '1' } as User);

        // Register a user with an email
        await service.signup('testemail@mail.com', 'd23v3343v134');

        // Attempt to register again with the same email
        await expect(service.signup('testemail@mail.com', 'd23v3343v134')).rejects.toThrow(
            BadRequestException,
        );
    });


    it('throws if signin is called with an unused email', async () => {
        await expect(
            service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
        ).rejects.toThrow(NotFoundException);
    });

    it('verify salt and password', async () => {

        // Register a user with an email and password
        await service.signup('test@mail.com', 'mypassword');

        // const password = 'mypassword';
        // // Generate a salt
        // const salt = randomBytes(8).toString('hex');
        // const hash = (await scrypt(password, salt, 32)) as Buffer;
        // const hashedPassWithSalt = salt + '.' + hash.toString('hex');

        // fakeUserService.findByEmail = (email: string) =>
        //     Promise.resolve({ id: 1, email: 'test@mail.com', password: hashedPassWithSalt } as User);

        // Attempt to sign in with the correct password
        await expect(service.signin('test@mail.com', 'mypassword123123')).rejects.toThrow(
            BadRequestException);
    });

    it('returns a user if correct password is provided', async () => {
        await service.signup('test@mail.com', 'mypassword');
        const user = await service.signin('test@mail.com', 'mypassword');
        expect(user).toBeDefined();
    });


});



