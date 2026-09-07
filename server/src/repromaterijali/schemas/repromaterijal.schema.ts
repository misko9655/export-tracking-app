import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ collection: 'repromaterijali', timestamps: true })
export class Repromaterijal {
    @Prop({ required: true, unique: true }) sifraRepromaterijala: string;
    @Prop({ default: '' }) nazivRepromaterijala: string;
    @Prop({ default: '' }) jedinicaMere: string;
    @Prop({ required: true, enum: ['sirovina', 'ambalaza'] }) tipRepromaterijala: 'sirovina' | 'ambalaza';
}

export type RepromaterijalDocument = HydratedDocument<Repromaterijal>;
export const RepromaterijalSchema = SchemaFactory.createForClass(Repromaterijal);
