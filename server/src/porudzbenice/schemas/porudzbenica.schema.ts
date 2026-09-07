import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type PorudzbenicaStavka = {
    _id: Types.ObjectId;
    artikalId: string;
    artikalNaziv: string;
    artikalJm: string;
    kolicina: number;
};

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Porudzbenica {
    @Prop({ required: true, unique: true })
    brojPorudzbenice: string;

    @Prop({ required: true })
    dobavljac: string;

    @Prop({ required: true, type: Date })
    datum: Date;

    @Prop({ default: '' })
    napomena: string;

    @Prop({ required: true, default: 'kreirana' })
    status: 'kreirana' | 'poslata' | 'realizovana';

    @Prop({ required: true })
    kreiranaOd: string;

    @Prop({
        type: [{
            artikalId: { type: String, required: true },
            artikalNaziv: { type: String, required: true },
            artikalJm: { type: String, default: '' },
            kolicina: { type: Number, required: true },
        }],
        default: [],
    })
    stavke: PorudzbenicaStavka[];
}

export type PorudzbenicaDocument = HydratedDocument<Porudzbenica>;
export const PorudzbenicaSchema = SchemaFactory.createForClass(Porudzbenica);
