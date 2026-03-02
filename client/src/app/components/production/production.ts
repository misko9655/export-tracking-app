import { Component, signal } from '@angular/core';
import { OrderItem } from '../../models/order-item.model';

@Component({
  selector: 'app-production',
  imports: [],
  templateUrl: './production.html',
  styleUrl: './production.scss',
})
export class Production {
  orderItems = signal<OrderItem[]>([]);
}
