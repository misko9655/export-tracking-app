import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { Loading } from './components/loading/loading';
import { Messages } from "./components/messages/messages";

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
}
