export type OrderItem = {
    id: string;
    orderId: string;
    productCode: string;
    productName: string;
    jm: string;
    normativId?: string;
    numberOfOrderedTp: number;
    numberOfReadyTp?: number;
    lot?: string;
    dateOfExpire?: Date;
    unitsInTransportBox?: number;
}