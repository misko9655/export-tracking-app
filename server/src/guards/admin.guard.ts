import { Injectable } from "node_modules/@nestjs/common";
import { AuthorizationGuard } from "./authorization.guard";

@Injectable()
export class AdminGuard extends AuthorizationGuard {
    constructor() {
        super(['ADMIN', 'SUPER_ADMIN']);
    }
}