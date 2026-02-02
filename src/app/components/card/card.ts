import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'app-card',
  imports: [
    MatCardModule,
    MatButtonModule
],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  title = input<string>();
  dataId = input.required<string>();
  fetchDataEvent = output<string>();

  onClick() {
    this.fetchDataEvent.emit(this.dataId());
  }

}
