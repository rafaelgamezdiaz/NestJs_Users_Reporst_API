import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {

    constructor(private userService: UsersService) { }


    async signup(email: string, password: string) {

        // See if the email is in use
        const user = await this.userService.findByEmail(email);
        if (user) {
            throw new BadRequestException('Email in use');
        }

        // Generate a salt
        const salt = randomBytes(8).toString('hex');

        // Hash the password and salt together
        const hash = (await scrypt(password, salt, 32)) as Buffer;

        // Join the hashed result and salt together
        const hashedPassWithSalt = salt + '.' + hash.toString('hex');

        return await this.userService.create(email, hashedPassWithSalt);
    }

    async signin(email: string, password: string) {

        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new NotFoundException('Invalid credentials');
        }

        const [salt, storedHash] = user.password.split('.');

        const hash = (await scrypt(password, salt, 32)) as Buffer;

        if (storedHash !== hash.toString('hex')) {
            throw new BadRequestException('Invalid credentials');
        }

        return user;
    }

}