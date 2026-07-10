export type TokenFromJWT = {
  authJwtToken: string;
  user: User;
}

export type PagePermission = { view: boolean; edit: boolean };

export type User = {
  roles: Array<string>;
  username: string;
  pagePermissions?: Record<string, PagePermission> | null;
}