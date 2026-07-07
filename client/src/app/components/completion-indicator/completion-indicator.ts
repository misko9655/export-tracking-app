import { Component, computed, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-completion-indicator',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './completion-indicator.html',
  styleUrl: './completion-indicator.scss',
})
export class CompletionIndicator {
  percent = input.required<number>();
  diameter = input<number>(56);

  statusClass = computed(() => {
    const p = this.percent();
    if (p >= 100) return 'complete';
    if (p <= 0) return 'none';
    return 'partial';
  });
}
