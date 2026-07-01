import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "node_modules/@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class AuthenticationGuard implements CanActivate {
    private readonly logger = new Logger(AuthenticationGuard.name);

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.warn("No user found in request. Access denied.");
            throw new UnauthorizedException("User is not authenticated");
        }
        return true;
    }

}