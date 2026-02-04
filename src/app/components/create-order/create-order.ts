import { Component, inject } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Order } from '../../../../shared/order';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-create-order',
  imports: [
    MatFormFieldModule, 
    ReactiveFormsModule, 
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule
  ],
  providers: [ provideNativeDateAdapter() ],
  templateUrl: './create-order.html',
  styleUrl: './create-order.css',
})
export class CreateOrder {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerId: string;
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);

  constructor() {
    this.customerId = this.route.snapshot.params['customerId'];
    console.log(this.customerId);

  }

  form = this.fb.group({
    orderNo: ['',[
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(20)
    ]],
    orderName: ['',[
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(15)
    ]],
    orderDate: [new Date(), Validators.required],
    deliveryDate: [new Date(), Validators.required]
  })

  createNewOrder() {
    const newOrder: Partial<Order> = {};
    newOrder.customerID = this.customerId;
    newOrder.orderName = this.form.value.orderName as string;
    newOrder.orderNo = this.form.value.orderNo as string;
    newOrder.orderDate = this.form.value.orderDate as Date;
    newOrder.deliveryDate = this.form.value.deliveryDate as Date;
    console.log(newOrder);
    this.orderService.createNewOrder(newOrder)
      .subscribe(res => {
        console.log(res);
        this.router.navigate(['/order', res._id])
      });

  }
}
