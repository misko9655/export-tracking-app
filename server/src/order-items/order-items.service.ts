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

    async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
        const normativ = this.normativTreeService.findByCode(createOrderItemDto.productCode);
        if (!normativ) {
            throw new NotFoundException(`Artikal sa šifrom ${createOrderItemDto.productCode} nije pronađen`);
        }
        const gp = normativ.tree[0];
        const artikal = await this.artikliLogistikaService.findByCode(createOrderItemDto.productCode);
        const createdOrderItem = new this.orderItemsModel({
            ...createOrderItemDto,
            productName: gp.artikalNaziv,
            jm: gp.artikalJm,
            normativId: normativ.id,
            unitsInTransportBox: artikal?.artikalJmUTp ?? 0,
            orderId: new Types.ObjectId(createOrderItemDto.orderId),
        });
        const saved = await createdOrderItem.save();
        this.eventsGateway.broadcast('order-item', 'created', { orderId: createOrderItemDto.orderId });
        return saved;
    }

    async createMultiple(createOrderItemDto: CreateOrderItemDto[]): Promise<OrderItem[]> {
        const itemDocs = await Promise.all(createOrderItemDto.map(async dto => {
            const normativ = this.normativTreeService.findByCode(dto.productCode);
            if (!normativ) {
                throw new NotFoundException(`Artikal sa šifrom ${dto.productCode} nije pronađen`);
            }
            const gp = normativ.tree[0];
            const artikal = await this.artikliLogistikaService.findByCode(dto.productCode);
            return {
                productCode: dto.productCode,
                productName: gp.artikalNaziv,
                jm: gp.artikalJm,
                normativId: normativ.id,
                unitsInTransportBox: artikal?.artikalJmUTp ?? 0,
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
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        this.eventsGateway.broadcast('order-item', 'updated', { id, orderId: updatedOrderItem.orderId?.toString() });
        return updatedOrderItem;
    }

    async updateLogistics(): Promise<{ updated: number; total: number }> {
        const [allItems, allArtikli] = await Promise.all([
            this.orderItemsModel.find().exec(),
            this.artikliLogistikaService.findAll(),
        ]);
        const paketaNapaletiByCode = new Map(allArtikli.map(a => [a.artikalId, a.paketaNapaleti]));

        const ops = allItems
            .map(item => {
                const numberOfTpOnPallet = paketaNapaletiByCode.get(item.productCode) ?? 0;
                if (item.numberOfTpOnPallet === numberOfTpOnPallet) return null;
                return {
                    updateOne: {
                        filter: { _id: item._id },
                        update: { $set: { numberOfTpOnPallet } },
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
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        this.eventsGateway.broadcast('order-item', 'deleted', { id, orderId: deletedOrderItem.orderId?.toString() });
        return deletedOrderItem;
    }
}
