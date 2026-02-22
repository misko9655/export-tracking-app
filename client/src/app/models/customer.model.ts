

export type Customer = {
    _id: string;
    name: string;
    country: string;
    deliveryAddress?: string;
    isActive: boolean;
}