import { IsString, Min, Max, IsLongitude, IsLatitude, IsNumber } from "class-validator";

export class CreateReportDto {

    @IsNumber()
    @Min(0)
    @Max(100000000)
    price: number;

    @IsString()
    make: string; // Company name

    @IsString()
    model: string; // Model name

    @IsNumber()
    @Min(1930)
    @Max(2050)
    year: number; // Year of manufacture

    @IsLongitude()
    lng: number; // Longitude (place of sale)

    @IsLatitude()
    lat: number; // Latitude 

    @IsNumber()
    @Min(0)
    @Max(1000000)
    mileage: number; // Mileage
}