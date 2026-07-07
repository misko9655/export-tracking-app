import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'qtyFormat', standalone: true })
export class QtyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 2): string {
    if (value == null) return '';
    return new Intl.NumberFormat('sr-RS', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
