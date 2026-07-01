import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'artikli-logistika' })
export class ArtikalLogistika {
    @Prop({ required: true, unique: true }) artikalId: string;
    @Prop({ default: '' }) artikalNaziv: string;
    @Prop({ default: 0 }) artikalJmUTp: number;
    @Prop({ default: '' }) artikalJm: string;

    @Prop({ default: 0 }) paketaNapaleti: number;

    @Prop({ default: 0 }) visinaJed: number;
    @Prop({ default: 0 }) sirinaJed: number;
    @Prop({ default: 0 }) dubinaJed: number;
    @Prop({ default: 0 }) nettoTezinaJed: number;
    @Prop({ default: 0 }) bruttoTezinaJed: number;

    @Prop({ default: 0 }) visinaTP: number;
    @Prop({ default: 0 }) sirinaTP: number;
    @Prop({ default: 0 }) dubinaTP: number;
    @Prop({ default: 0 }) nettoTezinaTP: number;
    @Prop({ default: 0 }) bruttoTezinaTP: number;
}

export const ArtikalLogistikaSchema = SchemaFactory.createForClass(ArtikalLogistika);
export type ArtikalLogistikaDocument = HydratedDocument<ArtikalLogistika>;
