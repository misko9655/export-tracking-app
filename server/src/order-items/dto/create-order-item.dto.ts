import { IsDate, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";


export class CreateOrderItemDto {
        @IsMongoId()
        @IsNotEmpty()
        orderId: Types.ObjectId;
        
        @IsOptional()
        @IsMongoId()
        productId: Types.ObjectId;
    
        @IsString()
        @IsNotEmpty()
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
        @IsDate()
        dateOfExpire?: Date;
}