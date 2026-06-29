import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "node_modules/@nestjs/common";

@Injectable()
export class AuthenticationGuard implements CanActivate {
    private readonly logger = new Logger(AuthenticationGuard.name);

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.warn("No user found in request. Access denied.");
            throw new UnauthorizedException("User is not authenticated");
        }
        return true;
    }

}