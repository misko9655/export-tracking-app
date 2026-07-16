import { IsBoolean, IsDateString, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";


export class CreateOrderDto {
    @IsNotEmpty()
    customerId: Types.ObjectId;

    @IsString()
    @IsOptional()
    orderNo?: string;

    
    @IsString()
    @IsNotEmpty()
    orderName: string;

    @IsDateString()
    @IsNotEmpty()
    orderDate: Date;

    @IsDateString()
    @IsNotEmpty()
    deliveryDate: Date;

    @IsNotEmpty()
    @IsObject()
    deliveryDateFromProduction: {date: Date, comment: string}

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsOptional()
    @IsObject()
    loadedOn: {date: Date, comment: string};

    @IsBoolean()
    @IsOptional()
    domesticMarket?: boolean;
}