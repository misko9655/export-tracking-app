import { Component, inject } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Observable } from 'rxjs';
import { Customer } from '../../../../shared/customer';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Card } from '../card/card';

@Component({
  selector: 'app-customers',
  imports: [Card, AsyncPipe],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers {

  customers$!: Observable<Customer[]>;
  private customerService = inject(CustomerService);
  private router = inject(Router);

  constructor() {
    this.customers$ = this.customerService.findAllCustomers();
  }

  goToCustomerOrders(customerId: string) {
    this.router.navigate(['/orders', customerId]);
  }

}
