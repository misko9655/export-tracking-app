import { Component, inject, input, linkedSignal, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Order } from '../../models/order.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { openEditOrderDialog } from '../edit-order-dialog/edit-order-dialog';
import { openConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-orders-card-list',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DatePipe
  ],
  templateUrl: './orders-card-list.html',
  styleUrl: './orders-card-list.scss',
})
export class OrdersCardList {
  orders = input.required<Order[]>();
  role = input.required<string | null>();
  orderUpdated = output<Order>();
  orderDeleted = output<string>();
  orderReordered = output<{ orderId: string; displayOrder: number }[]>();

  router = inject(Router);

  dialog = inject(MatDialog);
  dialogForConfirmation = inject(MatDialog);

  // Lokalna, odmah-mutabilna kopija ulaznog niza - da bi klik na strelicu odmah
  // vizuelno pomerio karticu, bez cekanja na round-trip kroz roditelja/server/
  // realtime osvezavanje. linkedSignal se automatski resetuje na 'orders()' kad
  // roditelj posalje stvarno nov niz (filter, realtime osvezavanje).
  localOrders = linkedSignal(() => this.orders());

  // Raspored je CSS grid sa 3 kolone - Angular CDK-ov drag-and-drop zvanicno
  // podrzava samo jednoosno (vertical/horizontal) sortiranje i daje nedosledne
  // rezultate cim prevlacenje predje granicu reda/kolone, zato su strelice
  // gore/dole (deterministicno pomeranje za jednu poziciju) umesto prevlacenja.
  canMoveUp(order: Order): boolean {
    return this.localOrders().findIndex(o => o.id === order.id) > 0;
  }

  canMoveDown(order: Order): boolean {
    const list = this.localOrders();
    return list.findIndex(o => o.id === order.id) < list.length - 1;
  }

  moveUp(order: Order) {
    this.move(order, -1);
  }

  moveDown(order: Order) {
    this.move(order, 1);
  }

  // Prenumerisemo CEO vidljivi (filtrirani) spisak na svako pomeranje, umesto da
  // pomerenoj kartici dodelimo samo sredinu izmedju trenutnih suseda - vecina
  // trebovanja ima podrazumevani displayOrder=0 (nikad ranije pomerana), pa bi
  // sredina izmedju dva suseda koja OBA imaju 0 ispala opet 0 (bez stvarne
  // promene), sto izgleda kao da strelica "ne radi" cim se naidje na dva
  // nedirnuta suseda. Sveza, ravnomerno razmaknuta vrednost za svaku stavku
  // garantuje da nema kolizija, bez obzira na istoriju prethodnih pomeranja.
  private move(order: Order, direction: -1 | 1) {
    const list = [...this.localOrders()];
    const index = list.findIndex(o => o.id === order.id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= list.length) return;

    moveItemInArray(list, index, targetIndex);
    const renumbered = list.map((o, i) => ({ ...o, displayOrder: (i + 1) * 1000 }));
    this.localOrders.set(renumbered);

    this.orderReordered.emit(
      renumbered.map(o => ({ orderId: o.id, displayOrder: o.displayOrder! }))
    );
  }

  async onEditOrder(order: Order) {
    const updatedOrder = await openEditOrderDialog(
      this.dialog,
      {
        mode: 'edit',
        title: `Izmeni podatke: ${order.orderName}`,
        customerId: order.customerId,
        order
      }
    );

    if (updatedOrder) {
      this.orderUpdated.emit(updatedOrder);
    }
  }

  async onDeleteOrder(order: Order) {

    const confirmation = await openConfirmationDialog(
          this.dialogForConfirmation,
          {
            message: 'Da li ste sigurni da želite da obrišete ovo trebovanje?',
            title: 'Potvrdi akciju'
          }
        );
        if(confirmation) {
            this.orderDeleted.emit(order.id);
        }

  }

  goToOrderDetails(orderId: string) {
    this.router.navigate(['/order-details', orderId]);
  }

  displayOrderState(state: string) {
    if(state === 'created') {
      return 'Trebovanje je kreirano';
    } else if(state === 'loading') {
      return 'Odvajanje je u toku';
    } else {
      return 'Trebovanje je isporučeno';
    }
  }
}
