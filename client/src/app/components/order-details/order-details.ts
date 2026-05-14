import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { OrderItem } from '../../models/order-item.model';
import { MatDialog } from '@angular/material/dialog';
import { openEditOrderItemDialog } from '../edit-order-item-dialog/edit-order-item-dialog';
import { OrderItemsService } from '../../services/order-items.service';
import { OrderItemsTable } from '../order-items-table/order-items-table';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { openUpdateDateDialog } from '../update-date-dialog/update-date-dialog';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { OrderUploader } from '../order-uploader/order-uploader';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-order-details',
  imports: [
    MatCardModule,
    MatIconModule,
    DatePipe,
    MatButtonModule,
    DatePipe,
    OrderItemsTable,
    OrderUploader
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'sr-Latn' }
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss',
})
export class OrderDetails {
  private route = inject(ActivatedRoute);
  private orderId = signal<string>(this.route.snapshot.params['orderId']);
  private ordersService = inject(OrdersService);
  private orderItemsService = inject(OrderItemsService);
  order = signal<Order | null>(null);
  orderItems = signal<OrderItem[]>([]);
  dialog = inject(MatDialog);
  dialogForUpdate = inject(MatDialog);
  private router = inject(Router);
authService = inject(AuthService);
  role = computed(() => this.authService.user() ? this.authService.user()!.roles[0] : null);

  constructor() {
    effect(() => {
      console.log(`Order Id from route: ${this.orderId()}`);
    })

    this.loadOrder()
      .then(() => { console.log('Order loaded successfully', this.order()) });

  }

  writeName() {
    return (this.order()?.customerId as Customer).name + ' - ' + this.order()?.orderName;
  }

  async loadOrder() {
    try {
      const order = await this.ordersService.loadOrder(this.orderId());
      this.order.set(order);
      const orderItems = await this.orderItemsService.loadAllOrderItems(this.orderId());
      this.orderItems.set(orderItems);
    }
    catch (error) {
      console.error('Error loading order: ', error);
    }
  }

  async addOrderItem() {
    const newOrderItem = await openEditOrderItemDialog(
      this.dialog,
      {
        title: 'Dodaj artikal',
        mode: 'create',
        orderId: this.orderId()
      }
    );

    if (!newOrderItem) {
      return;
    }

    const newOrderItems = [...this.orderItems(), newOrderItem];
    this.orderItems.set(newOrderItems);
  }

  async onOrderItemUpdated(updatedOrderItem: OrderItem) {
    const tempOrderItems = this.orderItems();
    const newOrderItems = tempOrderItems.map(orderItem => (
      orderItem.id === updatedOrderItem.id ? updatedOrderItem : orderItem
    ));
    this.orderItems.set(newOrderItems);
    if(this.order()?.state === 'created') {

      const updatedOrder = await this.ordersService.updateOrder(
        this.orderId(), 
        {state: 'loading', customerId: (this.order()?.customerId as Customer).id}
      );
      this.order.set(updatedOrder);
    }
  }

  async onOrderItemDeleted(orderItemId: string) {
    try {
      await this.orderItemsService.deleteOrderItem(orderItemId);
      const tempOrderItems = this.orderItems();
      const newOrderItems = tempOrderItems.filter(orderItem => (orderItemId !== orderItem.id));
      this.orderItems.set(newOrderItems);
    }
    catch (error) {
      console.error('Error deleting order item:', error);
    }
  }

  goToSupplyList() {
    this.router.navigate(['/supply', this.orderId()]);
  }

  async addDeliveryDate() {
    const newOrderData = await openUpdateDateDialog(
      this.dialogForUpdate,
      {
        title: 'Realan datum spremnosti robe',
        order: this.order()!,
        customerId: this.order()?.customerId!,
        mode: 'production'
      }
    );

    if (!newOrderData) {
      return;
    }


    this.order.set({ ...newOrderData });
  }

  async addLoadedDate() {
    const newOrderData = await openUpdateDateDialog(
      this.dialogForUpdate,
      {
        title: 'Utovar',
        order: this.order()!,
        customerId: this.order()?.customerId!,
        mode: 'delivery'
      }
    );

    if (!newOrderData) {
      return;
    }


    this.order.set({ ...newOrderData });
  }

  async createNewOrderFromUndeliveredItems() {


    try {

      const newOrder: Partial<Order> = {
        customerId: this.order()?.customerId,
        orderName: this.order()?.orderName + ' - neisporuceni artikli',
        deliveryDate: this.order()?.deliveryDate,
        deliveryDateFromProduction: this.order()?.deliveryDateFromProduction,
        orderDate: this.order()?.orderDate,
        orderNo: this.order()?.orderNo,
        state: 'loading',
        
      }

      let newOrderItems = this.orderItems()
        .filter(item => item.numberOfOrderedTp > item.numberOfReadyTp!)
        .map(item => {
          const newItem = { ...item };
          newItem.numberOfOrderedTp = item.numberOfOrderedTp - item.numberOfReadyTp!;
          newItem.numberOfReadyTp = 0;
          return newItem;
        });

      if (newOrderItems.length === 0) {
        alert('Svi artikli su isporučeni, nema neisporučenih artikala za kreiranje novog trebovanja.');
        return;
      }
      const createdOrder = await this.ordersService.createOrder(newOrder);
      newOrderItems = newOrderItems.map(item => {
        item.orderId = createdOrder.id;
        item.productId = (item.productId as Product).id;
        return item;
      })
      const createdOrderItems = await this.orderItemsService.createMultipleOrderItems(newOrderItems);
      this.orderId.set(createdOrder.id);
      this.loadOrder().then(() => { console.log('Order loaded successfully', this.order()) });;
    }
    catch (error) {
      console.error('Error creating order:', error);
      alert('Došlo je do greške prilikom kreiranja trebovanja. Molimo pokušajte ponovo.');
    }
  }

  async onOrderItemsUpload(items: Partial<OrderItem>[]) {
    const newOrderItems = items.map(item => {
      item.orderId = this.orderId();
      return item;
    })
    await this.orderItemsService.createMultipleOrderItems(newOrderItems);
    this.loadOrder().then(() => { console.log('Order loaded successfully', this.order()) })
  }

}
