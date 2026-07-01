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

@Component({
  selector: 'app-orders',
  imports: [
    MatButtonModule,
    MatIconModule,
    OrdersCardList,
    MatTabsModule
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
  role = computed(() => this.authService.user() ? this.authService.user()!.roles[0] : null);


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
      .subscribe(() => this.loadOrders());
  }

  async loadOrders() {
    try{
      const orders = await this.ordersService.loadAllOrders(this.customerId());
      this.#orders.set(orders)
    }
    catch(error) {
      console.error('Error loading orders:', error);
      this.messagesService.showMessage('Greška pri učitavanju trebovanja. Pokušajte ponovo.', 'error');
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
