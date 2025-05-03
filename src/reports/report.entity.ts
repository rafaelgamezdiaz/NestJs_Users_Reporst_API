import { User } from "src/users/users.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reports, { onDelete: 'CASCADE' })
    user: User; // User who created the report  

    @Column({ default: false })
    approved: boolean; // Report approved by admin

    @Column()
    price: number;

    @Column()
    make: string; // Company name

    @Column()
    model: string; // Model name

    @Column()
    year: number; // Year of manufacture

    @Column()
    lng: number; // Longitude (place of sale)

    @Column()
    lat: number; // Latitude 

    @Column()
    mileage: number; // Mileage
}