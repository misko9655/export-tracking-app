import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class BulkDeleteArtikliDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    artikalIds: string[];
}
