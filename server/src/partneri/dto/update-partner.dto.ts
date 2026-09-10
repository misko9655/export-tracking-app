import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdatePartnerDto {
    @IsOptional() @IsString() nazivPartnera?: string;
    @IsOptional() @IsString() adresa?: string;
    @IsOptional() @IsString() mesto?: string;
    @IsOptional() @IsIn(['', 'prevoznik', 'dobavljac']) kategorija?: string;
}
