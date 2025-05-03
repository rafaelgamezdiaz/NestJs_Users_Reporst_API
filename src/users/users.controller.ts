import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Session, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dtos/create.user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update.user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/curret-user.decorator';
import { User } from './users.entity';
import { AuthGuard } from 'src/guards/auth.guard';
// import { CurrentUserInterceptor } from './interceptors/current-user.interceptor'; // Ver la nota de abajo en el UseInterceptor


@Controller('users')
@Serialize(UserDto)
// @UseInterceptors(CurrentUserInterceptor) // Aplicando el interceptor de manera Local, actualmente no lo utilizo porque se aplico en el modulo UserModule de manera global a toda la aplicación,
// pero dejo esta nota aquí porque es posible que en algunos casos deseemos aplicar un enfoque local
export class UsersController {

    constructor(
        private userService: UsersService,
        private authService: AuthService
    ) { }



    // @Get('/whoAmI')
    // whoAmI(@Session() session: any) {
    //     if (!session.userId || isNaN(session.userId)) {
    //         throw new UnauthorizedException('User not authenticated');
    //     }
    //     return this.userService.findOne(session.userId);
    // }

    @Get('/whoAmI')
    @UseGuards(AuthGuard)
    whoAmI(@CurrentUser() user: User) {
        console.log('User:', user);
        return user;
    }


    /**
     * Create User
     * @param body 
     * @returns 
     */
    @Post('/auth/signup')
    async signup(@Body() body: CreateUserDto, @Session() session: any) {
        const user = await this.authService.signup(body.email, body.password);
        session.userId = user.id;
        return user;
    }

    /**
     * Login
     * @param body 
     * @param session 
     * @returns 
     */
    @Post('/auth/login')
    async login(@Body() body: CreateUserDto, @Session() session: any) {
        const user = await this.authService.signin(body.email, body.password);
        session.userId = user.id;
        return user;
    }


    /**
     * Logout
     * @param session 
     * @returns 
     */
    @Post('/auth/logout')
    logout(@Session() session: any) {
        delete session.userId;
        return { message: 'Ha cerrado la sesión' };
    }

    /**
     * Get User by email
     * @param email 
     * @returns 
     */
    @Get('find/email')
    findUserByEmail(@Query('email') email: string) {
        return this.userService.findByEmail(email);
    }

    /**
     * Get User by id
     * @param id 
     * @returns 
     */
    @Get('/find/:id')
    async findUser(@Param('id') id: string) {
        const user = await this.userService.findOne(parseInt(id));
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    /**
     * Get all users
     * @returns 
     */
    @Get('/all/find')
    findAllUsers() {
        return this.userService.findAll();
    }

    /**
     * Delete User by id
     * @param id 
     * @returns 
     */
    @Delete('/delete/:id')
    deleteUser(@Param('id') id: string) {
        try {
            return this.userService.remove(parseInt(id));
        } catch (error) {
            console.log('Error deleting user:', error.message);
            throw new NotFoundException(error.message);
        }
    }

    /**
     * Update User by id
     * @param id 
     * @param body 
     * @returns 
     */
    @Patch('update/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        try {
            return this.userService.update(parseInt(id), body);
        } catch (error) {
            console.log('Error en el Update');
        }

    }
}


