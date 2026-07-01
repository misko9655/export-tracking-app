import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'qty', standalone: true })
export class QtyPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 4): string {
    if (value == null) return '';
    return value.toFixed(decimals).replace('.', ',');
  }
}
