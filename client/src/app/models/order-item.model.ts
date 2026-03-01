import { Norm } from "./norm.model";


export type OrderItem = {
    _id: string;
    orderId: string;
    productId?: string | Norm;
    productCode: string;
    numberOfOrderedTp: number;
    numberOfReadyTp?: number;
    lot?: string;
    dateOfExpire?: Date;
}