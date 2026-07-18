import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationEmail, NotificationEmailSchema } from "./notification-email.schema";
import { NotificationEmailsService } from "./notification-emails.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: NotificationEmail.name, schema: NotificationEmailSchema }]),
    ],
    providers: [NotificationEmailsService],
    exports: [NotificationEmailsService],
})
export class NotificationEmailsModule {}
