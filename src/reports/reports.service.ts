import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create.dto';
import { Report } from './report.entity';
import { User } from 'src/users/users.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {

    constructor(@InjectRepository(Report) private reportRepository: Repository<Report>) { }

    async create(reportDto: CreateReportDto, user: User) {
        const report = this.reportRepository.create(reportDto);
        report.user = user; // Associate the report with the user
        return await this.reportRepository.save(report);
    }

    async changeApproval(id: number, approved: boolean) {
        //  console.log('Changing approval status for report with ID:', id, 'to:', approved);
        const report = await this.reportRepository.findOne({ where: { id } });
        // console.log('Changing approval status for report with ID:', report);

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        report.approved = approved;
        return await this.reportRepository.save(report);
    }

    async find() {
        return await this.reportRepository.find();
    }


    createEstimate(estimateDto: GetEstimateDto) {

        const queryBuilder = this.reportRepository.createQueryBuilder()
            .select('AVG(price)', 'price')
            .where('approved IS TRUE');

        // Añadir condiciones solo si los parámetros están presentes
        if (estimateDto.make) {
            queryBuilder.andWhere('LOWER(make) = LOWER(:make)', { make: estimateDto.make });
        }

        if (estimateDto.model) {
            queryBuilder.andWhere('LOWER(model) = LOWER(:model)', { model: estimateDto.model });
        }

        if (estimateDto.lng) {
            queryBuilder.andWhere('lng - :lng BETWEEN -5 AND 5', { lng: estimateDto.lng });
        }

        if (estimateDto.lat) {
            queryBuilder.andWhere('lat - :lat BETWEEN -5 AND 5', { lat: estimateDto.lat });
        }

        if (estimateDto.year) {
            queryBuilder.andWhere('year - :year BETWEEN -3 AND 3', { year: estimateDto.year });
        }

        if (estimateDto.mileage) {
            queryBuilder.orderBy('ABS(mileage - :mileage)', 'DESC')
                .setParameters({ mileage: estimateDto.mileage });
        }

        return queryBuilder.limit(3).getRawOne();
    }


}
