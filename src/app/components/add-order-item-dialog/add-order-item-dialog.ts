import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-add-order-item-dialog',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './add-order-item-dialog.html',
  styleUrl: './add-order-item-dialog.css',
})
export class AddOrderItemDialog {

  private fb = inject(FormBuilder);
  form = this.fb.group({
    itemCode: ['', Validators.required],
    orderedTp: ['', Validators.required]
  });

  close() {

  }

  save() {

  }
}
