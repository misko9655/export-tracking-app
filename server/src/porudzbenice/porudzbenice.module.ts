import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Porudzbenica, PorudzbenicaSchema } from "./schemas/porudzbenica.schema";
import { Counter, CounterSchema } from "./schemas/counter.schema";
import { PorudzbeniceController } from "./porudzbenice.controller";
import { PorudzbeniceService } from "./porudzbenice.service";
import { EventsModule } from "src/events/events.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Porudzbenica.name, schema: PorudzbenicaSchema },
            { name: Counter.name, schema: CounterSchema },
        ]),
        EventsModule,
    ],
    controllers: [PorudzbeniceController],
    providers: [PorudzbeniceService],
})
export class PorudzbeniceModule {}
