import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ collection: 'partneri', timestamps: true })
export class Partner {
    @Prop({ required: true, unique: true }) sifraPartnera: string;
    @Prop({ required: true }) nazivPartnera: string;
    @Prop({ default: '' }) adresa: string;
    @Prop({ default: '' }) mesto: string;
    @Prop({ default: '' }) kategorija: string;
}

export type PartnerDocument = HydratedDocument<Partner>;
export const PartnerSchema = SchemaFactory.createForClass(Partner);
