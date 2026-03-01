import { IsDate, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateOrderItemDto {
        @IsMongoId()
        @IsNotEmpty()
        orderId: string;
        
        @IsOptional()
        productId: string;
    
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