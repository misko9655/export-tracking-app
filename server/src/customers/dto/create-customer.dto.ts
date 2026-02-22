import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";


export class CreateCustomerDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    name: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    country: string;

    @IsOptional()
    @IsString()
    deliveryAddress?: string;

    @IsOptional()
    isActive?: boolean;
}