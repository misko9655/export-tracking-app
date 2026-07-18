import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "node_modules/@nestjs/common";


@Injectable()
export class AuthorizationGuard implements CanActivate {
    private readonly logger = new Logger(AuthorizationGuard.name);

    constructor(private allowedRoles: string[]) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const allowed = user && user.roles && this.isAllowed(user.roles);
        if (!allowed) {
            this.logger.warn(`Access denied for user: ${user?.username}`);
            throw new ForbiddenException("Nemate dozvolu za pristup ovom resursu");
        }
        return true;
    }

    isAllowed(userRoles: string[]): boolean {
        return userRoles.some(role => this.allowedRoles.includes(role));
    }

}