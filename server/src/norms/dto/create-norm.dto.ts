import { IsNotEmpty, IsString } from "class-validator";


export class CreateNormDto {
    @IsString()
    @IsNotEmpty()
    normCode: string;

    @IsString()
    @IsNotEmpty()
    normUnitOfMeasure: string;

    @IsString()
    @IsNotEmpty()
    elementType: string;

    @IsString()
    @IsNotEmpty()
    elementWarehouseID: string;

    @IsString()
    @IsNotEmpty()
    elementWarehouseName: string;

    @IsString()
    @IsNotEmpty()
    elementItemCode: string;

    @IsString()
    @IsNotEmpty()
    elementItemName: string;

    @IsString()
    @IsNotEmpty()
    elementItemUnitOfMeasure: string;

    @IsString()
    @IsNotEmpty()
    elementItemQuantity: number;
}