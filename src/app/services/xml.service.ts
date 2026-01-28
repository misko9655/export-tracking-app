import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import Item from '../model/item';

@Injectable({
  providedIn: 'root',
})
export class XmlService {
  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http
      .get('./lager_xml.xml', { responseType: 'text' })
      .pipe(
        map(xml => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xml, 'application/xml');
          const items = Array.from(xmlDoc.getElementsByTagName('z:row')).map(element => {
            const attributes = element.attributes;
            const itemCode = attributes.getNamedItem('SifraArtikla')?.value || '';
            const name = attributes.getNamedItem('NazivArtikla')?.value || '';
            const barcode = attributes.getNamedItem('BarKod')?.value || '';
            const unitOfMeasure = attributes.getNamedItem('JM')?.value || '';
            return new Item(itemCode, name, barcode, unitOfMeasure);
          })
          console.log('test');
          
          console.log(new Object(items))
          console.log('test');
          const jsonString = JSON.stringify(items, null, 2);
          console.log(jsonString);
        return items;
      })
    )
  }
}
