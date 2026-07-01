import { IsNumber, IsOptional } from 'class-validator';

export class UpdateArtikalLogistikaDto {
    @IsOptional() @IsNumber() paketaNapaleti?: number;
    @IsOptional() @IsNumber() visinaJed?: number;
    @IsOptional() @IsNumber() sirinaJed?: number;
    @IsOptional() @IsNumber() dubinaJed?: number;
    @IsOptional() @IsNumber() nettoTezinaJed?: number;
    @IsOptional() @IsNumber() bruttoTezinaJed?: number;
    @IsOptional() @IsNumber() visinaTP?: number;
    @IsOptional() @IsNumber() sirinaTP?: number;
    @IsOptional() @IsNumber() dubinaTP?: number;
    @IsOptional() @IsNumber() nettoTezinaTP?: number;
    @IsOptional() @IsNumber() bruttoTezinaTP?: number;
}
