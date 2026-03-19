import { CommonModule} from '@angular/common';
import { Component, computed, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-date-range',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    MatButtonModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'sr-Latn' }
  ],
  templateUrl: './date-range.html',
  styleUrl: './date-range.scss',
})
export class DateRange {
  startDate = model<Date | null>(null);
  endDate = model<Date | null>(null);

  selectedRange = signal<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  rangeUpdated = output<{ start: Date | null; end: Date | null }>();

  constructor() {
    this.updateRangeSignal();
  }

  private updateRangeSignal() {
    this.selectedRange.set({
      start: this.startDate(),
      end: this.endDate()
    });
    this.rangeUpdated.emit(this.selectedRange());
  }

  onStartDateChange() {
    if (this.endDate() && this.startDate() && this.endDate()! < this.startDate()!) {
      this.endDate.set(null);
    }
    this.updateRangeSignal();

  }

  onEndDateChange() {
    if (this.startDate() && this.endDate() && this.endDate()! < this.startDate()!) {
      this.endDate.set(null);
    } else {
      this.updateRangeSignal();
    }
  }

  clearDates() {
    this.startDate.set(null);
    this.endDate.set(null);
    this.updateRangeSignal();
  }

  setThisMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.startDate.set(start);
    this.endDate.set(end);
    this.updateRangeSignal();
  }

  setNextWeek() {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);

    this.startDate.set(start);
    this.endDate.set(end);
    this.updateRangeSignal();
  }

  isValidRange = computed(() => {
    const start = this.selectedRange().start;
    const end = this.selectedRange().end;
    return !!(start && end && start <= end);
  });

  hasBothDateSelected = computed(() =>
    !!(this.selectedRange().start && this.selectedRange().end)
  );
}
