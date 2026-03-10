import { Customer } from "./customer.model";
import { Norm } from "./norm.model";
import { Order } from "./order.model";


export type ProductionItem = {
    id: string;
    productCode: string;
    numberOfOrderedTp: number;
    numberOfReadyTp: number;
    productId: Partial<Norm>;
    orderId: Partial<Order> & { customerId: Partial<Customer>};
}