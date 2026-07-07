import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'qtyTooltip', standalone: true })
export class QtyTooltipPipe implements PipeTransform {
  transform(value: number | null | undefined): string | null {
    if (value == null) return null;
    const rounded2 = Math.round(value * 100) / 100;
    if (Math.abs(rounded2 - value) < 1e-9) return null;
    return new Intl.NumberFormat('sr-RS', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  }
}
