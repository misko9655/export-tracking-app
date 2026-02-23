import { IsBoolean, IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateOrderDto {
    @IsMongoId()
    @IsNotEmpty()
    customerId: string;

    @IsString()
    @IsNotEmpty()
    orderNo: string;

    
    @IsString()
    @IsNotEmpty()
    orderName: string;

    @IsDateString()
    @IsNotEmpty()
    orderDate: Date;

    @IsDateString()
    @IsNotEmpty()
    deliveryDate: Date;

    @IsBoolean()
    @IsOptional()
    isDelivered?: boolean;
}