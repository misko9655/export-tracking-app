import { Customer } from "./customer.model";


export type Order = {
    _id: string;
    customerId: string;
    orderNo: string;
    orderName: string;
    orderDate: Date;
    deliveryDate: Date;
    isDelivered: boolean;
}