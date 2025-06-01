import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonInput,
  IonText,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonInput,
    IonText,
    IonIcon
  ],
})
export class ForgotPasswordPage {
  email: string = '';
  loading: boolean = false;
  error: string | null = null;
  message: string | null = null;

  constructor(
    private auth: AuthService,
    public router: Router
  ) { }

  async sendReset() {
    if (!this.email) return;
    this.loading = true;
    this.error = null;
    this.message = null;

    try {
      await this.auth.sendPasswordResetEmail(this.email);
      this.message = 'Password reset email sent. Please check your inbox.';
      this.email = '';
    } catch (err) {
      this.error = 'Failed to send reset email. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
