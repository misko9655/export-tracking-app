import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ArtikalLogistikaUpdateItem {
    @IsString()
    artikalId: string;

    @IsOptional() @IsNumber() artikalJmUTp?: number;
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

export class BulkUpdateArtikliDto {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ArtikalLogistikaUpdateItem)
    updates: ArtikalLogistikaUpdateItem[];
}
