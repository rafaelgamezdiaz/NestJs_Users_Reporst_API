import { AfterInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;


    @Column()
    email: string;

    @Column()
    password: string;

    @AfterInsert()
    logRegistered() {
        console.log('User registered:', this.email);
    }
}