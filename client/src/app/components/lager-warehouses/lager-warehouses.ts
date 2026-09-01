import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SKLADISTA } from '../../models/skladiste.model';

@Component({
  selector: 'app-lager-warehouses',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './lager-warehouses.html',
  styleUrl: './lager-warehouses.scss',
})
export class LagerWarehouses {
  private router = inject(Router);

  skladista = SKLADISTA;

  goToSkladiste(skladisteId: string) {
    this.router.navigate(['/lager', skladisteId]);
  }
}
