import { IsNotEmpty, IsNumber, IsString } from "class-validator";



export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    productCode: string;
    
    @IsString()
    @IsNotEmpty()
    productName: string;
    
    @IsString()
    @IsNotEmpty()
    unitOfMeasure: string;
    
    @IsNumber()
    @IsNotEmpty()
    unitsInTransportBox: number;
    
    @IsString()
    @IsNotEmpty()
    normCode: string;
}