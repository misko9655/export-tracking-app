import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PAGE_KEY_METADATA } from "src/decorators/require-page-edit.decorator";

@Injectable()
export class PagePermissionGuard implements CanActivate {
    private readonly logger = new Logger(PagePermissionGuard.name);

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const pageKey = this.reflector.get<string>(PAGE_KEY_METADATA, context.getHandler());
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User does not have permission to access this resource');
        }

        const explicit = pageKey ? user.pagePermissions?.[pageKey] : null;
        const allowed = explicit ? explicit.edit === true : !user.roles?.includes('VIEWER');

        if (!allowed) {
            this.logger.warn(`Access denied for user: ${user?.username} (page: ${pageKey})`);
            throw new ForbiddenException('User does not have permission to access this resource');
        }
        return true;
    }
}
