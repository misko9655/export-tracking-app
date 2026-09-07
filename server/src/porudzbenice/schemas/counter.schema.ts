import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

// Mala pomoćna kolekcija za atomsko generisanje sekvencijalnih brojeva
// porudžbenica (npr. _id "porudzbenica-2026", seq 1, 2, 3...).
@Schema({ collection: 'counters' })
export class Counter {
    @Prop({ required: true }) _id: string;
    @Prop({ required: true, default: 0 }) seq: number;
}

export type CounterDocument = HydratedDocument<Counter>;
export const CounterSchema = SchemaFactory.createForClass(Counter);
