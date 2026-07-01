import { inject } from '@angular/core';
import { MAT_DATE_LOCALE, MatDateFormats, NativeDateAdapter } from '@angular/material/core';

export class SrDateAdapter extends NativeDateAdapter {
  constructor() {
    super(inject(MAT_DATE_LOCALE));
  }

  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.trim()) {
      const cleaned = value.trim().replace(/\.$/, '');
      const parts = cleaned.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const fullYear = year >= 0 && year <= 99 ? 2000 + year : year;
        if (!isNaN(day) && !isNaN(month) && !isNaN(fullYear) && fullYear > 0) {
          return new Date(fullYear, month, day);
        }
      }
    }
    return super.parse(value);
  }

  override format(date: Date, _displayFormat: Object): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}.`;
  }
}

export const SR_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: 'DD.MM.YYYY.' },
  display: {
    dateInput: 'DD.MM.YYYY.',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD.MM.YYYY.',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
