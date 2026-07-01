import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { Types } from "mongoose";


export class CreateOrderItemDto {
        @IsMongoId()
        @IsNotEmpty()
        orderId: Types.ObjectId;

        @IsString()
        @IsNotEmpty()
        @Transform(({ value }) => String(value).toUpperCase().trim())
        productCode: string;
    
        @IsNumber()
        @IsNotEmpty()
        numberOfOrderedTp: number;
    
        @IsNumber()
        @IsOptional()
        numberOfReadyTp?: number;
    
        @IsOptional()
        @IsString()
        lot?: string;
        
        @IsOptional()
        @IsDateString()
        dateOfExpire?: Date;
}