import { Customer } from "./customer.model";
import { Order } from "./order.model";


export type ProductionItem = {
    id: string;
    productCode: string;
    productName: string;
    jm: string;
    unitsInTransportBox: number;
    normativId: string;
    numberOfOrderedTp: number;
    numberOfReadyTp: number;
    orderId: Partial<Order> & { customerId: Partial<Customer> };
}

export type GroupedProductionItem = {
    productCode: string;
    productName: string;
    unitOfMeasure: string;
    unitsInTransportBox: number;
    normativId: string;
    totalOrderedTp: number;
    totalReadyTp: number;
    items: ProductionItem[];
    isExpanded?: boolean;
}
