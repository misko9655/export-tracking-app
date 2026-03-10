import { Customer } from "./customer.model";


export type Order = {
    id: string;
    customerId: string;
    orderNo: string;
    orderName: string;
    orderDate: Date;
    deliveryDate: Date;
    isDelivered: boolean;
}