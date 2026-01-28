import { Injectable } from '@angular/core';
import Item from '../model/item';
import ListOfItems from '../model/listOfItems';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemsLoadService {
  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http
      .get('/api/items', { responseType: 'text' })
      .pipe(
        map(response => {
              console.log('response from server:', response);
              const items = JSON.parse(response) as Item[];
          // const items = Array.from(xmlDoc.getElementsByTagName('z:row')).map(element => {
          //   const attributes = element.attributes;
          //   const itemCode = attributes.getNamedItem('SifraArtikla')?.value || '';
          //   const name = attributes.getNamedItem('NazivArtikla')?.value || '';
          //   const barcode = attributes.getNamedItem('BarKod')?.value || '';
          //   const unitOfMeasure = attributes.getNamedItem('JM')?.value || '';
          //   return new Item(itemCode, name, barcode, unitOfMeasure);
          return items;
          })

      
      );
    
  }
}
