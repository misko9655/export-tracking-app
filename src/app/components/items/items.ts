import { Component } from '@angular/core';
import { ItemsLoadService } from '../../services/items-load.service';
import { ItemsService } from '../../services/items.service';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { XmlService } from '../../services/xml.service';
import Item from '../../model/item';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-items',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './items.html',
  styleUrl: './items.css',
})
export class Items {
  searchString: string = '';
  items$: Observable<Item[]>;
  constructor(private itemsLoadService: ItemsLoadService, public itemsService: ItemsService) {
     this.items$ = this.itemsLoadService.getItems();
  }

  ngOnInit() {
  }
}
