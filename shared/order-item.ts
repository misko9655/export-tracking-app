

export class OrderItem {
    _id: string;
    orderId: string;
    productId: string;
    numberOfOrderedTp: number;
    numberOfReadyTp: number;
    numberOfDeliveredTp: number;

    constructor(_id: string, orderId: string, productId: string, numberOfOrderedTp: number, numberOfReadyTp: number, numberOfDeliveredTp: number) {
        this._id = _id;
        this.orderId = orderId;
        this.productId = productId;
        this.numberOfOrderedTp = numberOfOrderedTp;
        this.numberOfReadyTp = numberOfReadyTp;
        this.numberOfDeliveredTp = numberOfDeliveredTp;
    }
}

export class AddOrderItemData {
  itemCode: string;
  orderedTp: number;

  constructor(itemCode: string, orderedTp: number) {
    this.itemCode = itemCode;
    this.orderedTp = orderedTp;
  }
}