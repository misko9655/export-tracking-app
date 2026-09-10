import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePartnerDto {
    @IsNotEmpty() @IsString() sifraPartnera: string;
    @IsNotEmpty() @IsString() nazivPartnera: string;
    @IsOptional() @IsString() adresa?: string;
    @IsOptional() @IsString() mesto?: string;
    @IsOptional() @IsIn(['', 'prevoznik', 'dobavljac']) kategorija?: string;
}
