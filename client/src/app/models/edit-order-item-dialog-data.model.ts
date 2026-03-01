import { OrderItem } from "./order-item.model";


export type EditOrderItemDialogData = {
    mode: 'create' | 'edit';
    title: string;
    orderItem?: OrderItem;
    orderId: string;
}