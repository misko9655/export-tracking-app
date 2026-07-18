import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OrderItem, OrderItemDocument } from "./order-item.schema";
import { Model, Types } from "mongoose";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";
import { NormativTreeService } from "src/normativ-tree/normativ-tree.service";
import { EventsGateway } from "src/events/events.gateway";
import { ArtikliLogistikaService } from "src/artikli-logistika/artikli-logistika.service";


@Injectable()
export class OrderItemsService {
    constructor(
        @InjectModel(OrderItem.name) private orderItemsModel: Model<OrderItemDocument>,
        private normativTreeService: NormativTreeService,
        private artikliLogistikaService: ArtikliLogistikaService,
        private eventsGateway: EventsGateway,
    ) { }

    private async resolveArtikal(productCode: string): Promise<{
        productName: string;
        jm: string;
        normativId: string;
        unitsInTransportBox: number;
        numberOfTpOnPallet: number;
        hasNormativ: boolean;
        hasLogisticsInfo: boolean;
    }> {
        const normativ = this.normativTreeService.findByCode(productCode);
        if (normativ) {
            const gp = normativ.tree[0];
            const artikal = await this.artikliLogistikaService.findByCode(productCode);
            return {
                productName: gp.artikalNaziv,
                jm: gp.artikalJm,
                normativId: normativ.id,
                unitsInTransportBox: artikal?.artikalJmUTp ?? 0,
                numberOfTpOnPallet: artikal?.paketaNapaleti ?? 0,
                hasNormativ: true,
                hasLogisticsInfo: !!artikal,
            };
        }

        const artikal = await this.artikliLogistikaService.findByCode(productCode);
        if (!artikal) {
            throw new NotFoundException(`Artikal sa šifrom ${productCode} nije pronađen`);
        }
        return {
            productName: artikal.artikalNaziv,
            jm: artikal.artikalJm,
            normativId: '',
            unitsInTransportBox: artikal.artikalJmUTp ?? 0,
            numberOfTpOnPallet: artikal.paketaNapaleti ?? 0,
            hasNormativ: false,
            hasLogisticsInfo: true,
        };
    }

    async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
        const resolved = await this.resolveArtikal(createOrderItemDto.productCode);
        const createdOrderItem = new this.orderItemsModel({
            ...createOrderItemDto,
            ...resolved,
            orderId: new Types.ObjectId(createOrderItemDto.orderId),
        });
        const saved = await createdOrderItem.save();
        this.eventsGateway.broadcast('order-item', 'created', { orderId: createOrderItemDto.orderId });
        return saved;
    }

    async createMultiple(createOrderItemDto: CreateOrderItemDto[]): Promise<OrderItem[]> {
        const itemDocs = await Promise.all(createOrderItemDto.map(async dto => {
            const resolved = await this.resolveArtikal(dto.productCode);
            return {
                productCode: dto.productCode,
                ...resolved,
                numberOfOrderedTp: dto.numberOfOrderedTp,
                numberOfReadyTp: 0,
                orderId: new Types.ObjectId(dto.orderId),
            };
        }));

        const inserted = await this.orderItemsModel.insertMany(itemDocs);

        const result = await this.orderItemsModel
            .find({ _id: { $in: inserted.map(i => i._id) } })
            .exec();
        this.eventsGateway.broadcast('order-item', 'created', { orderId: createOrderItemDto[0]?.orderId });
        return result;
    }

    async findAll(orderId: string): Promise<OrderItem[]> {
        const objectId = new Types.ObjectId(orderId);
        return this.orderItemsModel.find({ orderId: objectId }).exec();
    }

    async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
        const orderItemForUpdate = { ...updateOrderItemDto };
        orderItemForUpdate.orderId = new Types.ObjectId(orderItemForUpdate.orderId);

        const updatedOrderItem = await this.orderItemsModel
            .findByIdAndUpdate(id, orderItemForUpdate, { returnDocument: 'after' })
            .exec();

        if (!updatedOrderItem) {
            throw new NotFoundException(`Stavka trebovanja sa id-em ${id} nije pronađena`);
        }
        this.eventsGateway.broadcast('order-item', 'updated', { id, orderId: updatedOrderItem.orderId?.toString() });
        return updatedOrderItem;
    }

    async updateLogistics(): Promise<{ updated: number; total: number }> {
        const [allItems, allArtikli] = await Promise.all([
            this.orderItemsModel.find().exec(),
            this.artikliLogistikaService.findAll(),
        ]);
        const artikliByCode = new Map(allArtikli.map(a => [a.artikalId, a]));

        const ops = allItems
            .map(item => {
                const artikal = artikliByCode.get(item.productCode);
                const numberOfTpOnPallet = artikal?.paketaNapaleti ?? 0;
                const unitsInTransportBox = artikal?.artikalJmUTp ?? 0;
                const set: Record<string, number> = {};
                if (item.numberOfTpOnPallet !== numberOfTpOnPallet) set.numberOfTpOnPallet = numberOfTpOnPallet;
                if (item.unitsInTransportBox !== unitsInTransportBox) set.unitsInTransportBox = unitsInTransportBox;
                if (Object.keys(set).length === 0) return null;
                return {
                    updateOne: {
                        filter: { _id: item._id },
                        update: { $set: set },
                    },
                };
            })
            .filter((op): op is NonNullable<typeof op> => op !== null);

        if (ops.length) {
            await this.orderItemsModel.bulkWrite(ops);
        }

        this.eventsGateway.broadcast('order-item', 'updated', {});
        return { updated: ops.length, total: allItems.length };
    }

    async delete(id: string): Promise<OrderItem> {
        const deletedOrderItem = await this.orderItemsModel.findByIdAndDelete(id).exec();

        if (!deletedOrderItem) {
            throw new NotFoundException(`Stavka trebovanja sa id-em ${id} nije pronađena`);
        }
        this.eventsGateway.broadcast('order-item', 'deleted', { id, orderId: deletedOrderItem.orderId?.toString() });
        return deletedOrderItem;
    }
}
