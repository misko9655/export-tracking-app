import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const isSuperAdmin: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.user()?.roles?.includes('SUPER_ADMIN')) {
        return true;
    }
    return router.parseUrl('/home');
};
