import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddOrderItemData } from '../../../../shared/order-item'

@Component({
  selector: 'app-add-order-item-dialog',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './add-order-item-dialog.html',
  styleUrl: './add-order-item-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddOrderItemDialog {

  private fb = inject(FormBuilder);
  private data: AddOrderItemData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<AddOrderItemDialog>)


  form = this.fb.group({
    itemCode: [this.data.itemCode, Validators.required],
    orderedTp: [this.data.orderedTp, Validators.required]
  });

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.form.value);
  }
}

export function openAddOrderItemDialog(dialog: MatDialog) {
  const config = new MatDialogConfig();
  config.disableClose = true;
  config.autoFocus = true;
  const data: AddOrderItemData = {
    itemCode: '',
    orderedTp: 0
  }
  config.data = {...data};

  const dialogRef = dialog.open(AddOrderItemDialog, config);
  return dialogRef.afterClosed();
}


