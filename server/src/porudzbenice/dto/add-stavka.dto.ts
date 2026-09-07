import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AddStavkaDto {
    @IsString()
    @IsNotEmpty()
    artikalId: string;

    @IsString()
    @IsNotEmpty()
    artikalNaziv: string;

    @IsOptional()
    @IsString()
    artikalJm?: string;

    @IsNumber()
    @IsNotEmpty()
    kolicina: number;
}
