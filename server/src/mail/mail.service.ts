import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { NotificationEmailsService } from "src/notification-emails/notification-emails.service";

type OrderCreatedInfo = {
    orderName: string;
    customerName: string;
    deliveryDate: Date;
};

type CommentAddedInfo = {
    orderName: string;
    customerName: string;
    username: string;
    text: string;
};

const ORDER_CREATED_DELAY_MS = 20 * 1000;

@Injectable()
export class MailService implements OnModuleInit {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter | null = null;

    constructor(
        private configService: ConfigService,
        private notificationEmailsService: NotificationEmailsService,
    ) {}

    onModuleInit() {
        const host = this.configService.get<string>('SMTP_HOST');
        const port = this.configService.get<string>('SMTP_PORT');
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASS');

        if (!host || !port || !user || !pass) {
            this.logger.warn('SMTP nije konfigurisan (nedostaju SMTP_* env promenljive) — email obaveštenja su onemogućena');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port: Number(port),
            secure: this.configService.get<string>('SMTP_SECURE') === 'true',
            auth: { user, pass },
        });
    }

    sendOrderCreatedNotification(order: OrderCreatedInfo): void {
        if (!this.transporter) {
            return;
        }

        setTimeout(() => {
            this.sendOrderCreatedNotificationNow(order);
        }, ORDER_CREATED_DELAY_MS);
    }

    private async sendOrderCreatedNotificationNow(order: OrderCreatedInfo): Promise<void> {
        if (!this.transporter) {
            return;
        }

        try {
            const recipients = await this.notificationEmailsService.findAll();
            if (!recipients.length) {
                return;
            }

            await this.transporter.sendMail({
                from: this.configService.get<string>('SMTP_FROM'),
                bcc: recipients.map(r => r.email),
                subject: `Novo trebovanje: ${order.orderName} (${order.customerName})`,
                text: [
                    'Kreirano je novo trebovanje.',
                    '',
                    `Kupac: ${order.customerName}`,
                    `Naziv trebovanja: ${order.orderName}`,
                    `Datum isporuke: ${order.deliveryDate?.toLocaleDateString?.('sr-Latn') ?? order.deliveryDate}`,
                ].join('\n'),
            });
        } catch (err) {
            this.logger.error('Slanje email obaveštenja nije uspelo', err instanceof Error ? err.stack : err);
        }
    }

    sendCommentAddedNotification(info: CommentAddedInfo): void {
        if (!this.transporter) {
            return;
        }
        // Bez odloženog slanja (za razliku od sendOrderCreatedNotification) — šalje se odmah.
        void this.sendCommentAddedNotificationNow(info);
    }

    private async sendCommentAddedNotificationNow(info: CommentAddedInfo): Promise<void> {
        if (!this.transporter) {
            return;
        }

        try {
            const recipients = await this.notificationEmailsService.findAll();
            if (!recipients.length) {
                return;
            }

            await this.transporter.sendMail({
                from: this.configService.get<string>('SMTP_FROM'),
                bcc: recipients.map(r => r.email),
                subject: `Novi komentar na trebovanje: ${info.orderName} (${info.customerName})`,
                text: [
                    'Dodat je novi komentar na trebovanje.',
                    '',
                    `Kupac: ${info.customerName}`,
                    `Trebovanje: ${info.orderName}`,
                    `Korisnik: ${info.username}`,
                    `Komentar: ${info.text}`,
                ].join('\n'),
            });
        } catch (err) {
            this.logger.error('Slanje email obaveštenja o komentaru nije uspelo', err instanceof Error ? err.stack : err);
        }
    }
}
