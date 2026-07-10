import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PagePermission = { view: boolean; edit: boolean };

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class User {

    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    roles: Array<string>;

    @Prop({required: true})
    passwordHash: string;

    // Optional per-user override of page view/edit access. When null/unset, access falls
    // back to the legacy role-based behavior (see PagePermissionGuard / PermissionsService).
    @Prop({ type: Object, default: null })
    pagePermissions: Record<string, PagePermission> | null;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);