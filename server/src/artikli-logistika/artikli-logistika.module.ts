import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtikalLogistika, ArtikalLogistikaSchema } from './artikal-logistika.schema';
import { ArtikliLogistikaService } from './artikli-logistika.service';
import { ArtikliLogistikaController } from './artikli-logistika.controller';
import { NormativTreeModule } from 'src/normativ-tree/normativ-tree.module';
import { EventsModule } from 'src/events/events.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ArtikalLogistika.name, schema: ArtikalLogistikaSchema }]),
        NormativTreeModule,
        EventsModule,
    ],
    controllers: [ArtikliLogistikaController],
    providers: [ArtikliLogistikaService],
    exports: [ArtikliLogistikaService],
})
export class ArtikliLogistikaModule {}
