import { IsIn, IsNotEmpty } from "class-validator";

export class UpdateStatusDto {
    @IsIn(['kreirana', 'poslata', 'realizovana'])
    @IsNotEmpty()
    status: 'kreirana' | 'poslata' | 'realizovana';
}
