import { Injectable } from '@angular/core';
import Item from '../model/item';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  items: Item[] = [];

  constructor() {}
}
