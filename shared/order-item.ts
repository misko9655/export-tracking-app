

export class OrderItem {
    _id: string;
    orderId: string;
    productId: string;
    numberOfOrderedTP: number;
    numberOfReadyTP: number;
    numberOfDeliveredTP: number;

    constructor(_id: string, orderId: string, productId: string, numberOfOrderedTP: number, numberOfReadyTP: number, numberOfDeliveredTP: number) {
        this._id = _id;
        this.orderId = orderId;
        this.productId = productId;
        this.numberOfOrderedTP = numberOfOrderedTP;
        this.numberOfReadyTP = numberOfReadyTP;
        this.numberOfDeliveredTP = numberOfDeliveredTP;
    }
}