import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { PermissionsService } from "../services/permissions.service";

/**
 * Route guard factory — usage: canActivate: [pageAccessGuard('customers')]
 * Blocks navigation (redirects to /home) when the current user's explicit pagePermissions
 * deny "view" for the given page key. Users without an explicit override pass through
 * (legacy behavior — everyone sees every page).
 */
export function pageAccessGuard(pageKey: string): CanActivateFn {
    return (route: ActivatedRouteSnapshot) => {
        const permissionsService = inject(PermissionsService);
        const router = inject(Router);
        if (permissionsService.canView(pageKey)) {
            return true;
        }
        return router.parseUrl('/home');
    };
}
