import { Customer } from "./customer.model";
import { Norm } from "./norm.model";
import { Order } from "./order.model";
import { Product } from "./product.model";


export type SupplyItem = {
    id: string;
    productCode: string;
    numberOfOrderedTp: number;
    numberOfReadyTp: number;
    productId: Partial<Product> & { norms: Norm[] };
    orderId: Partial<Order> & { customerId: Partial<Customer>};
}

export type GroupedSupplyItem = {
elementItemCode: string;        // Ključ za grupisanje
  elementItemName: string;        // Naziv artikla
  elementItemUnitOfMeasure: string; // Jedinica mere
  totalQuantity: number;          // Ukupna količina
  items: NormItem[]; 
}

export type NormItem = {
  norm: Norm,
  totalOrderedBox: number;
  unitsInTransportBox: number;
}

