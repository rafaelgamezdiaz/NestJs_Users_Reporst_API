import { Transform } from "class-transformer";
import { IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class GetEstimateDto {

    @IsString()
    @IsOptional()
    make?: string; // Company name

    @IsString()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase() : value)
    model?: string; // Model name

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1930)
    @Max(2050)
    @IsOptional()
    year?: number; // Year of manufacture

    @Transform(({ value }) => parseFloat(value))
    @IsLongitude()
    @IsOptional()
    lng?: number; // Longitude (place of sale)

    @Transform(({ value }) => parseFloat(value))
    @IsLatitude()
    @IsOptional()
    lat?: number; // Latitude 

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(0)
    @Max(1000000)
    @IsOptional()
    mileage?: number; // Mileage
}