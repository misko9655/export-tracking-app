import { Component, OnInit } from '@angular/core';
import { TabsService } from '../../services/tabs.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  constructor(public tabsService: TabsService) {}

  ngOnInit(): void {
    this.tabsService.changeTab(1);
  }
}
