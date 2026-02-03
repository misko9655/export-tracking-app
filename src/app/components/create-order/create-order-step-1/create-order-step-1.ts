import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-create-order-step-1',
  imports: [
    MatFormFieldModule, 
    ReactiveFormsModule, 
    MatInputModule,
    MatDatepickerModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './create-order-step-1.html',
  styleUrl: './create-order-step-1.css',
})
export class CreateOrderStep1 {
  private fb = inject(FormBuilder);

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

  get orderName() {
    return this.form.controls['orderName'];
  }
}
