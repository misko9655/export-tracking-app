

export type OrderItem = {
    _id: string;
    orderId: string;
    productId?: string;
    productCode: string;
    numberOfOrderedTp: number;
    numberOfReadyTp?: number;
    lot?: string;
    dateOfExpire?: Date;
}