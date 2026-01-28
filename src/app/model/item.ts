// export interface Item {
//     itemCode: string;
//     name: string;
//     barcode: string;
//     unitOfMeasure: string;
//     numberOfUnitsInTransportPackage: number;
// }

class Item {
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

export default Item;