import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Observable } from 'rxjs';
import { Order } from '../../../../shared/order';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-order',
  imports: [AsyncPipe, DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class OrderComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderId: string;
  order$: Observable<Order>;
  private ordersService = inject(OrderService);

  constructor() {
    this.orderId = this.route.snapshot.params['orderId'];
    this.order$ = this.ordersService.findOrder(this.orderId);
  }


}
