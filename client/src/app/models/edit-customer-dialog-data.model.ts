import { Customer } from "./customer.model";

export type EditCustomerDialogData = {
    mode: 'create' | 'edit';
    title: string;
    customer?: Customer;
}