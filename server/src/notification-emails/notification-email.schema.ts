import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ collection: 'notification-emails', timestamps: true })
export class NotificationEmail {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;
}

export const NotificationEmailSchema = SchemaFactory.createForClass(NotificationEmail);
export type NotificationEmailDocument = HydratedDocument<NotificationEmail>;
