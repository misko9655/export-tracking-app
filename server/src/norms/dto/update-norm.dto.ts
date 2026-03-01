import { PartialType } from "@nestjs/mapped-types";
import { CreateNormDto } from "./create-norm.dto";


export class UpdateNormDto extends PartialType(CreateNormDto) {}
