import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MessagesService } from '../../services/messages.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  hidePassword = true;
  fb = inject(FormBuilder);
  messagesService = inject(MessagesService);
  authService = inject(AuthService);
  router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  private static readonly FIELD_LABELS: Record<string, string> = {
    username: 'Korisničko ime',
    password: 'Šifra',
  };

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    const label = Login.FIELD_LABELS[controlName] ?? controlName;

    if (control?.hasError('required')) {
      return `${label} je obavezno polje`;
    }

    if (control?.hasError('minlength')) {
      return 'Šifra mora imati najmanje 6 karaktera';
    }

    return '';
  }

  async onLogin() {
    try {
      const {username, password } = this.loginForm.value;
      if(!username || !password) {
        this.messagesService.showMessage('Molimo popunite sva polja', 'error');
        return;
      }
      const token = await this.authService.login(username, password);
      if(token) {
        await this.router.navigate(['/home']);
      }
    }
    catch (error) {
      console.error('Login failed', error);
      this.messagesService.showMessage('Prijava nije uspela. Pokušajte ponovo.', 'error');
    }
  }
}
