import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { NotificationEmailsModule } from "src/notification-emails/notification-emails.module";

@Module({
    imports: [NotificationEmailsModule],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
