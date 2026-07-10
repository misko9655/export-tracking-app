import { SetMetadata } from "@nestjs/common";

export const PAGE_KEY_METADATA = 'pageKey';

/** Marks a route as requiring "edit" access to the given page key, checked by PagePermissionGuard. */
export const RequirePageEdit = (pageKey: string) => SetMetadata(PAGE_KEY_METADATA, pageKey);
