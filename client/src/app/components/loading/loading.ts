import { Component, inject, Signal, signal } from '@angular/core';
import { MatProgressSpinner, MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading {
  loadingService = inject(LoadingService); 
  loading = this.loadingService.loading;
}
