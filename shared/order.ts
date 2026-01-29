

export class Order { 
    _id: string;
    customerID: string;
    orderNo: string;
    orderName: string;
    orderDate: Date
    deliveryDate: Date;

    constructor(
        _id: string,
        customerID: string,
        orderNo: string,
        orderName: string,
        orderDate: Date,
        deliveryDate: Date
    ) {
        this._id = _id;
        this.customerID = customerID;
        this.orderNo = orderNo;
        this.orderName = orderName;
        this.orderDate = orderDate;
        this.deliveryDate = deliveryDate;
    }

}