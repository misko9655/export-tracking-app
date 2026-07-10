import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private authService = inject(AuthService);

  /** Whether the current user can see/navigate to the given page (sidenav link + route guard). */
  canView(page: string): boolean {
    const user = this.authService.user();
    const explicit = user?.pagePermissions?.[page];
    if (explicit) return explicit.view;
    return true; // legacy behavior: every logged-in user sees every page
  }

  /** Whether the current user can create/edit/delete data on the given page. */
  canEdit(page: string): boolean {
    const user = this.authService.user();
    const explicit = user?.pagePermissions?.[page];
    if (explicit) return explicit.edit;
    return user?.roles?.[0] !== 'VIEWER'; // legacy behavior
  }
}
