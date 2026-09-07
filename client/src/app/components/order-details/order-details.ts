import { Component, computed, effect, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService } from '../../services/realtime.service';
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
import { openUpdateDateDialog } from '../update-date-dialog/update-date-dialog';
import { AuthService } from '../../services/auth.service';
import { OrderUploader } from '../order-uploader/order-uploader';
import { Customer } from '../../models/customer.model';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';
import { OrderComments } from '../order-comments/order-comments';
import { openCheckAvailabilityDialog } from '../check-availability-dialog/check-availability-dialog';
import { openConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { CompletionIndicator } from '../completion-indicator/completion-indicator';

@Component({
  selector: 'app-order-details',
  imports: [
    MatCardModule,
    MatIconModule,
    DatePipe,
    MatButtonModule,
    DatePipe,
    OrderItemsTable,
    OrderUploader,
    OrderComments,
    CompletionIndicator,
  ],
  providers: [],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss',
})
export class OrderDetails {
  private route = inject(ActivatedRoute);
  orderId = signal<string>(this.route.snapshot.params['orderId']);
  private ordersService = inject(OrdersService);
  private orderItemsService = inject(OrderItemsService);
  order = signal<Order | null>(null);
  orderItems = signal<OrderItem[]>([]);
  dialog = inject(MatDialog);
  dialogForUpdate = inject(MatDialog);
  private router = inject(Router);
  authService = inject(AuthService);
  private messagesService = inject(MessagesService);
  realtimeService = inject(RealtimeService);
  destroyRef = inject(DestroyRef);
  role = computed(() => this.authService.effectiveRole());

  constructor() {
    effect(() => {
      console.log(`Order Id from route: ${this.orderId()}`);
    })

    this.loadOrder()
      .then(() => { console.log('Order loaded successfully', this.order()) });

    this.realtimeService.onDataChanged('order-item')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (!event['orderId'] || event['orderId'] === this.orderId()) {
          this.ordersService.invalidate();
          this.loadOrder();
        }
      });

    this.realtimeService.onDataChanged('order')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (!event['id'] || event['id'] === this.orderId()) {
          this.ordersService.invalidate();
          this.loadOrder();
        }
      });
  }

  writeName() {
    return (this.order()?.customerId as Customer).name + ' - ' + this.order()?.orderName;
  }

  completionPercent = computed(() => {
    const items = this.orderItems();
    const totalOrdered = items.reduce((sum, i) => sum + i.numberOfOrderedTp, 0);
    const totalReady = items.reduce((sum, i) => sum + (i.numberOfReadyTp ?? 0), 0);
    if (totalOrdered <= 0) return 0;
    return Math.min(100, Math.floor((totalReady / totalOrdered) * 100));
  });

  async loadOrder() {
    try {
      const order = await this.ordersService.loadOrder(this.orderId());
      this.order.set(order);
      const orderItems = await this.orderItemsService.loadAllOrderItems(this.orderId());
      this.orderItems.set(orderItems);
    }
    catch (error) {
      console.error('Error loading order: ', error);
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Greška pri učitavanju trebovanja. Pokušajte ponovo.', 'error');
      }
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

    await this.loadOrder();
    await this.syncCompletionState();
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
    await this.syncCompletionState();
  }

  // Automatski prelaz u 'ready' kad su svi artikli kompletirani (odvojeno >=
  // trebovano), nazad u 'loading' ako naknadna izmena (nov artikal, smanjena
  // odvojena kolicina) to poništi, i nazad u 'created' ako se odvojena kolicina
  // za SVE artikle vrati na 0 (npr. artikli fizicki prebaceni na drugo
  // trebovanje pa je "odvojeno" rucno vraceno na 0 na ovom) - u tom slucaju
  // odvajanje na ovom trebovanju vise nije ni zapoceto. Pozvano samo iz metoda
  // koje predstavljaju direktnu akciju TRENUTNOG korisnika nad stavkama (ne iz
  // loadOrder(), koji se okida i na tudje realtime izmene - inace bi svaki
  // otvoren tab kod svakog korisnika pokusao da upise status pri svakom tudjem
  // osvezavanju).
  private async syncCompletionState() {
    const order = this.order();
    if (!order || order.state === 'delivered') return;
    const items = this.orderItems();
    const allComplete = items.length > 0 && items.every(i => (i.numberOfReadyTp ?? 0) >= i.numberOfOrderedTp);
    const noneStarted = items.length === 0 || items.every(i => (i.numberOfReadyTp ?? 0) <= 0);

    let targetState: Order['state'] | null = null;
    if (allComplete && order.state !== 'ready') {
      targetState = 'ready';
    } else if (!allComplete && noneStarted && order.state !== 'created') {
      targetState = 'created';
    } else if (!allComplete && !noneStarted && order.state === 'ready') {
      targetState = 'loading';
    }

    if (targetState) {
      const updated = await this.ordersService.updateOrder(this.orderId(), {
        state: targetState,
        customerId: (order.customerId as Customer).id,
      });
      this.order.set(updated);
    }
  }

  async onDeleteAllOrderItems() {
    const confirmation = await openConfirmationDialog(this.dialog, {
      title: 'Potvrdi brisanje',
      message: `Da li ste sigurni da želite da obrišete SVE artikle (${this.orderItems().length}) sa ovog trebovanja? Ova akcija se ne može poništiti.`,
    });
    if (!confirmation) return;

    try {
      const result = await this.orderItemsService.deleteAllForOrder(this.orderId());
      this.orderItems.set([]);
      await this.syncCompletionState();
      this.messagesService.showMessage(`Obrisano ${result.deleted} artikala sa trebovanja.`, 'success');
    } catch (error) {
      console.error('Error deleting all order items:', error);
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Greška pri brisanju artikala. Pokušajte ponovo.', 'error');
      }
    }
  }

  async onOrderItemDeleted(orderItemId: string) {
    try {
      await this.orderItemsService.deleteOrderItem(orderItemId);
      const tempOrderItems = this.orderItems();
      const newOrderItems = tempOrderItems.filter(orderItem => (orderItemId !== orderItem.id));
      this.orderItems.set(newOrderItems);
      await this.syncCompletionState();
    }
    catch (error) {
      console.error('Error deleting order item:', error);
    }
  }

  goToSupplyList() {
    this.router.navigate(['/supply', this.orderId()]);
  }

  checkAvailability() {
    openCheckAvailabilityDialog(this.dialog, { orderItems: this.orderItems() });
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
        this.messagesService.showMessage('Svi artikli su isporučeni, nema neisporučenih artikala za kreiranje novog trebovanja.', 'info');
        return;
      }
      const createdOrder = await this.ordersService.createOrder(newOrder);
      newOrderItems = newOrderItems.map(item => {
        item.orderId = createdOrder.id;
        return item;
      })
      const createdOrderItems = await this.orderItemsService.createMultipleOrderItems(newOrderItems);
      this.orderId.set(createdOrder.id);
      this.loadOrder().then(() => { console.log('Order loaded successfully', this.order()) });;
    }
    catch (error) {
      console.error('Error creating order:', error);
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Došlo je do greške prilikom kreiranja trebovanja. Molimo pokušajte ponovo.', 'error');
      }
    }
  }

  onCommentChange(updatedOrder: Order) {
    this.order.set(updatedOrder);
  }

  async onOrderItemsUpload(items: Partial<OrderItem>[]) {
    const newOrderItems = items.map(item => {
      item.orderId = this.orderId();
      return item;
    })
    await this.orderItemsService.createMultipleOrderItems(newOrderItems);
    await this.loadOrder();
    await this.syncCompletionState();
  }

}
