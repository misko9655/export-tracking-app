import { IsBoolean, IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";


export class CreateOrderDto {
    @IsMongoId()
    @IsNotEmpty()
    customerId: Types.ObjectId;

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