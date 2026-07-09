import { Injectable } from "@nestjs/common";
import { AuthorizationGuard } from "./authorization.guard";

@Injectable()
export class SuperAdminGuard extends AuthorizationGuard {
    constructor() {
        super(['SUPER_ADMIN']);
    }
}
