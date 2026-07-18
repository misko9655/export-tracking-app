import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NotificationEmail, NotificationEmailDocument } from "./notification-email.schema";

@Injectable()
export class NotificationEmailsService {
    constructor(
        @InjectModel(NotificationEmail.name) private model: Model<NotificationEmailDocument>,
    ) {}

    async findAll(): Promise<NotificationEmail[]> {
        return this.model.find().sort({ createdAt: 1 }).exec();
    }

    async add(email: string): Promise<NotificationEmail> {
        const normalized = email.toLowerCase().trim();
        const existing = await this.model.findOne({ email: normalized }).exec();
        if (existing) {
            throw new ConflictException(`Email adresa ${normalized} je već na listi`);
        }
        const created = new this.model({ email: normalized });
        return created.save();
    }

    async remove(id: string): Promise<void> {
        const deleted = await this.model.findByIdAndDelete(id).exec();
        if (!deleted) {
            throw new NotFoundException(`Email sa id-em ${id} nije pronađen`);
        }
    }
}
