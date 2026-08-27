import { Component, computed, effect, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService } from '../../services/realtime.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { openEditOrderDialog } from '../edit-order-dialog/edit-order-dialog';
import { MatDialog } from '@angular/material/dialog';
import { Order } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrdersCardList } from '../orders-card-list/orders-card-list';
import { MatTabsModule} from '@angular/material/tabs'
import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';
import { CustomerLagerTab } from '../customer-lager-tab/customer-lager-tab';

@Component({
  selector: 'app-orders',
  imports: [
    MatButtonModule,
    MatIconModule,
    OrdersCardList,
    MatTabsModule,
    CustomerLagerTab
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  #orders = signal<Order[]>([]);
  ordersService = inject(OrdersService);
  private route = inject(ActivatedRoute);
  private customerId = signal<string>(this.route.snapshot.params['customerId']);
  dialog = inject(MatDialog);
  authService = inject(AuthService);
  private messagesService = inject(MessagesService);
  realtimeService = inject(RealtimeService);
  destroyRef = inject(DestroyRef);
  role = computed(() => this.authService.effectiveRole());
  activeTabIndex = signal(0);


  activeOrders = computed(() => {
    return this.#orders().filter(order => order.state === 'created' || order.state === 'loading');
  })
  deliveredOrders = computed(() => {
    return this.#orders().filter(order => order.state === 'delivered');
  })

  constructor() {
    effect(() => {
      console.log('Customer ID from route:', this.customerId());
    });

    this.loadOrders()
      .then(() => console.log('Orders loaded successfully', this.#orders()));

    this.realtimeService.onDataChanged('order')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.ordersService.invalidate();
        this.loadOrders();
      });
  }

  // Broji pozive loadOrders() da bi se odbacio odgovor koji stigne posle nekog
  // kasnijeg poziva (npr. kad reorder brzo prati realtime osvezavanje sopstvene
  // izmene) - bez ovoga stariji odgovor moze da prepise sveziji state.
  private loadToken = 0;

  async loadOrders() {
    const token = ++this.loadToken;
    try{
      const orders = await this.ordersService.loadAllOrders(this.customerId());
      if (token !== this.loadToken) return;
      this.#orders.set(orders)
    }
    catch(error) {
      if (token !== this.loadToken) return;
      console.error('Error loading orders:', error);
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Greška pri učitavanju trebovanja. Pokušajte ponovo.', 'error');
      }
    }
  }
  
  async onAddOrder() {
    const newOrder = await openEditOrderDialog(
      this.dialog,
      {
        title: 'Dodaj novo trebovanje',
        mode: 'create',
        customerId: this.customerId()
      }
    );

    if (!newOrder) {
      return;
    }

    await this.loadOrders();
  }

  onOrderUpdated(updatedOrder: Order) {
    const tempOrders = this.#orders();
    const newOrders = tempOrders.map(order => (
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    this.#orders.set(newOrders);
  }

  async onOrderReordered(events: { orderId: string; displayOrder: number }[]) {
    const displayOrderById = new Map(events.map(e => [e.orderId, e.displayOrder]));
    const tempOrders = this.#orders();
    const newOrders = tempOrders
      .map(order => (
        displayOrderById.has(order.id) ? { ...order, displayOrder: displayOrderById.get(order.id) } : order
      ))
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    this.#orders.set(newOrders);
    try {
      await Promise.all(events.map(e =>
        this.ordersService.updateOrder(e.orderId, { displayOrder: e.displayOrder })
      ));
    } catch (error) {
      console.error('Error reordering orders:', error);
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Greška pri čuvanju redosleda. Pokušajte ponovo.', 'error');
      }
      await this.loadOrders();
    }
  }

  async onOrderDeleted(orderId: string) {
    try {
      await this.ordersService.deleteOrder(orderId);
      const tempOrders = this.#orders();
      const newOrders = tempOrders.filter(order => order.id !== orderId);
      this.#orders.set(newOrders);
    }
    catch (error) {
      console.error('Error deleting order:', error);
    }
  }
}
