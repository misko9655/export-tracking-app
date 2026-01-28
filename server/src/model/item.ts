export class Item {
    itemCode: string;
    name: string;
    barcode: string;
    unitOfMeasure: string;

    constructor(itemCode: string, name: string, barcode: string, unitOfMeasure: string ) {
        this.itemCode = itemCode;
        this.name = name;
        this.barcode = barcode;
        this.unitOfMeasure = unitOfMeasure;
    }
}
