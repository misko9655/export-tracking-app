import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateRepromaterijalDto {
    @IsOptional() @IsString() nazivRepromaterijala?: string;
    @IsOptional() @IsString() jedinicaMere?: string;
    @IsOptional() @IsIn(['sirovina', 'ambalaza']) tipRepromaterijala?: 'sirovina' | 'ambalaza';
}
