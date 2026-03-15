import { Customer } from "./customer.model";
import { Norm } from "./norm.model";
import { Order } from "./order.model";
import { Product } from "./product.model";


export type ProductionItem = {
    id: string;
    productCode: string;
    numberOfOrderedTp: number;
    numberOfReadyTp: number;
    productId: Partial<Product>;
    orderId: Partial<Order> & { customerId: Partial<Customer>};
}

export type GroupedProductionItem = {
    productCode: string;
    productName: string;
    unitOfMeasure: string;
    unitsInTransportBox: number;
    totalOrderedTp: number;
    items: ProductionItem[];
    isExpanded?: boolean;
}