import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TabsService {
  activeTab: number;
  constructor(
    private router: Router,
    private location: Location
  ) {
    this.activeTab = -1;
  }

  changeTab(tab: number) {
    if(this.activeTab === tab) return;

    switch(tab) {
      case 1:
      default: 
        this.activeTab = 1;
        this.router.navigateByUrl('/home');
        break;
      case 2:
        this.activeTab = 2;
        this.router.navigateByUrl('/export_orders');
        break;
      case 3: 
        this.activeTab = 3;
        this.router.navigateByUrl('/production');
        break;
      case 4:
        this.activeTab = 4;
        this.router.navigateByUrl('/supply');
        break;
    }
  }
}
