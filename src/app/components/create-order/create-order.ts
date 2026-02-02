import { Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { CreateOrderStep1 } from './create-order-step-1/create-order-step-1';
import { CreateOrderStep2 } from './create-order-step-2/create-order-step-2';
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'app-create-order',
  imports: [
    MatStepperModule,
    CreateOrderStep1,
    CreateOrderStep2,
    MatButtonModule
],
  templateUrl: './create-order.html',
  styleUrl: './create-order.css',
})
export class CreateOrder {

}
