import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

    async create(email: string, password: string) {
        const user = this.userRepository.create({ email, password });
        return await this.userRepository.save(user);
    }


    async findOne(id: number) {
        return await this.userRepository.findOneBy({ id });
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOneBy({ email });


        // La sigueinte manera de hacer la query retorna un array
        // const user = await this.userRepository.find({ where: { email } });
        // if (user.length > 0) {
        //     return user[0];
        // }
        // return {};

        // La siguiente manera de hacer la query retorna un elemento
        //return await this.userRepository.findOne({ where: { email } });
    }

    async findAll() {
        console.log('findAllUsers');
        return await this.userRepository.find();
    }

    async remove(id: number) {
        const user = await this.userRepository.findOneBy({ id });

        if (!user) {
            console.log('User not found');
            throw new NotFoundException('User not found');
        }

        return await this.userRepository.remove(user);
    }

    async update(id: number, attrs: Partial<User>) {
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        Object.assign(user, attrs);
        return await this.userRepository.save(user);
    }


}


