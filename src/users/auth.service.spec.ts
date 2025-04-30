import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./users.entity";

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        // Create a fake copy of UserService
        const fakeUserService: Partial<UsersService> = {
            findByEmail: () => Promise.resolve({} as User),
            create: (email: string, password: string) => Promise.resolve({ id: 1, email, password } as User),
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
});

