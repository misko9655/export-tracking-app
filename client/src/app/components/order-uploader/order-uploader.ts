import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderItem } from '../../models/order-item.model';

@Component({
  selector: 'app-order-uploader',
  imports: [],
  templateUrl: './order-uploader.html',
  styleUrl: './order-uploader.scss',
})
export class OrderUploader {
  loading = signal<boolean>(false);
  artikli: Array<Partial<OrderItem>> = [];
  errorMessage = '';
  orderItems = output<Partial<OrderItem>[]>();

  async onFileChange(event: any) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    this.loading.set(true);
    this.artikli = [];
    this.errorMessage = '';

    try {
      // Dinamički import - exceljs se ne učitava dok korisnik ne izabere fajl
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      // Uzmi prvi sheet
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        this.errorMessage = 'Excel fajl nema sheet-ova';
        return;
      }

      console.log('====== Učitani podaci ======');
      console.log('Ime sheet-a:', worksheet.name);
      console.log('Ukupno redova:', worksheet.rowCount);

      // Preskoči header red (prvi red)
      let startRow = 1;

      // Iteracija kroz redove
      const ucitaniArtikli = [];

      for (let i = startRow; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const sifraCell = row.getCell(1); // Prva kolona - šifra artikla
        const pakovanjaCell = row.getCell(2); // Druga kolona - broj transportnih pakovanja

        let sifra = sifraCell.value?.toString()?.trim() || '';
        let brojPakovanja = this.extractNumber(pakovanjaCell.value);

        // Preskoči prazne redove
        if (sifra === '' || sifra === 'null' || sifra === 'undefined') {
          continue;
        }

        // Validacija broja pakovanja
        if (isNaN(brojPakovanja) || brojPakovanja < 0) {
          console.warn(`Red ${i}: Neispravan broj pakovanja za šifru "${sifra}" - postavljeno na 0`);
          brojPakovanja = 0;
        }

        ucitaniArtikli.push({
          productCode: sifra,
          numberOfOrderedTp: brojPakovanja
        });

        console.log(`Red ${i}: Šifra: "${sifra}", Pakovanja: ${brojPakovanja}`);
      }

      this.artikli = ucitaniArtikli;

      console.log(`\n✅ Ukupno učitanih artikala: ${this.artikli.length}`);
      console.log('Kompletna lista:', this.artikli);

      if (this.artikli.length === 0) {
        this.errorMessage = 'Nema podataka za učitavanje. Proverite da li fajl sadrži podatke u prve dve kolone.';
      }
      if(this.artikli.length > 0) {
        this.orderItems.emit([...this.artikli]);
      }

    } catch (error) {
      console.error('Greška pri učitavanju:', error);
      this.errorMessage = 'Došlo je do greške pri učitavanju fajla. Proverite format fajla.';
      this.artikli = [];
    } finally {
      console.log('test');
      this.loading.set(false);
      target.value = '';
    }
  }

  private extractNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }

    // Ako je već broj
    if (typeof value === 'number') {
      return value;
    }

    // Ako je string
    if (typeof value === 'string') {
      const cleaned = value.trim().replace(/[^\d,-]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }

    // Ako je Excel formula ili objekat
    if (typeof value === 'object') {
      if ('result' in value) {
        return this.extractNumber(value.result);
      }
      if ('text' in value) {
        return this.extractNumber(value.text);
      }
    }

    return 0;
  }
}
