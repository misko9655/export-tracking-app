import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { Loading } from './components/loading/loading';
import { Messages } from "./components/messages/messages";
import { AuthService } from './services/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLinkWithHref,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    Loading,
    Messages
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('client');

  canGoBack: boolean = true;
  router = inject(Router);
  authService = inject(AuthService);
  location = inject(Location);


  ngOnInit() {
    // Proverite da li postoji prethodna stranica u istoriji
    this.canGoBack = window.history.length > 1;

    // Push a new state when the page loads
    history.pushState(null, '', window.location.href);

    // Listen for the back button (popstate event) and push the state again
    window.onpopstate = function () {
      history.pushState(null, '', window.location.href);
    };
  }

  goBack(): void {
    if (this.canGoBack) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
