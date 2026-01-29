

export class Customer {
    _id: string;
    customerName: string;
    customerCountry: string;

    constructor(_id: string, customerName: string, customerCountry: string) {
        this._id = _id;
        this.customerName = customerName;
        this.customerCountry = customerCountry;
    }
}