import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonInput,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ]
})
export class ForgotPasswordPage {
  email = '';
  message: string | null = null;
  error: string | null = null;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async sendReset() {
    this.loading = true;
    this.message = null;
    this.error = null;
    try {
      await this.auth.sendPasswordResetEmail(this.email);
      this.message = 'Password reset email sent. Please check your inbox.';
    } catch (err) {
      this.error = 'Failed to send reset email. Please check your email address.';
    } finally {
      this.loading = false;
    }
  }
}
