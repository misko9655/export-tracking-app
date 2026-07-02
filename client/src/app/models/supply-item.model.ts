import { Customer } from "./customer.model";
import { NormativNode } from "./normativ.model";
import { Order } from "./order.model";


export type SupplyItem = {
    id: string;
    productCode: string;
    productName: string;
    jm: string;
    normativId: string;
    unitsInTransportBox: number;
    numberOfOrderedTp: number;
    numberOfReadyTp: number;
    orderId: Partial<Order> & { customerId: Partial<Customer> };
}

export type GroupedSupplyItem = {
    elementItemCode: string;
    elementItemName: string;
    elementItemUnitOfMeasure: string;
    totalQuantity: number;
    availableQuantity: number;
    customsQuantity: number;
    items: NormItem[];
    isExpanded?: boolean;
}

export type NormItem = {
    node: NormativNode;
    productCode: string;
    productName: string;
    totalOrderedBox: number;
    totalReadyBox: number;
    unitsInTransportBox: number;
    totalNeededBox: number;
    localQuantity: number;
    allocatedQuantity: number;
    orderName: string;
    deliveryDate: Date;
}
