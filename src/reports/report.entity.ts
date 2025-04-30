import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    price: string;

    @Column()
    report: string;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}