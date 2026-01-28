

export class Norm {
    _id: string;
    normCode: string;
    normUnitOfMeasure: string;
    elementType: string;
    elementWarehouseID: string;
    elementWarehouseName: string;
    elementItemCode: string;
    elementItemName: string;
    elementItemUnitOfMeasure: string;
    elementItemQuantity: number;

    constructor(
        _id: string,
        normCode: string,
        normUnitOfMeasure: string,
        elementType: string,
        elementWarehouseID: string,
        elementWarehouseName: string,
        elementItemCode: string,
        elementItemName: string,
        elementItemUnitOfMeasure: string,
        elementItemQuantity: number
    ) {
        this._id = _id;
        this.normCode = normCode;
        this.normUnitOfMeasure = normUnitOfMeasure;
        this.elementType = elementType;
        this.elementWarehouseID = elementWarehouseID;
        this.elementWarehouseName = elementWarehouseName;
        this.elementItemCode = elementItemCode;
        this.elementItemName = elementItemName;
        this.elementItemUnitOfMeasure = elementItemUnitOfMeasure;
        this.elementItemQuantity = elementItemQuantity;
    }


}