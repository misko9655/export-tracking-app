import { Norm } from "./norm.model";
import { Product } from "./product.model";


export type OrderItem = {
    id: string;
    orderId: string;
    productId?: string | Product;
    productCode: string;
    numberOfOrderedTp: number;
    numberOfReadyTp?: number;
    lot?: string;
    dateOfExpire?: Date;
}