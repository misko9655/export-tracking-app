import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class NotViewerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user?.roles?.includes('VIEWER')) {
            throw new ForbiddenException('Korisnik sa ulogom VIEWER nema dozvolu za izmene');
        }
        return true;
    }
}
