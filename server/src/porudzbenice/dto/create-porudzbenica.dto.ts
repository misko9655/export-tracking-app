import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePorudzbenicaDto {
    @IsString()
    @IsNotEmpty()
    dobavljac: string;

    @IsDateString()
    @IsNotEmpty()
    datum: Date;

    @IsOptional()
    @IsString()
    napomena?: string;
}
