import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonNote,
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonNote,
  ]
})
export class ProfilePage implements OnInit, OnDestroy {
  user: User | null = null;
  userInitials: string = '';
  displayName: string = '';
  email: string = '';
  isEditing = false;
  loading = true;
  private authSubscription: Subscription | null = null;

  // Password update
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showPasswordUpdate = false;
  passwordError: string = '';

  constructor(
    private auth: AuthService,
    public router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.authSubscription = this.auth.user$.subscribe(u => {
      if (!u) {
        this.router.navigate(['/login']);
      } else {
        this.user = u;
        this.displayName = u.displayName || '';
        this.email = u.email || '';
        this.userInitials = this.generateInitials(u);
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  generateInitials(user: User): string {
    if (user.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    } else if (user.email) {
      const parts = user.email.split(/[@.]/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.email[0].toUpperCase();
    }
    return '?';
  }

  startEditing() {
    this.isEditing = true;
  }

  async updateProfile() {
    if (!this.user) return;

    try {
      await this.auth.updateProfile({
        displayName: this.displayName
      });
      this.isEditing = false;
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  cancelEdit() {
    this.displayName = this.user?.displayName || '';
    this.isEditing = false;
  }

  logout() {
    this.auth.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  showPasswordUpdateForm() {
    this.showPasswordUpdate = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
  }

  cancelPasswordUpdate() {
    this.showPasswordUpdate = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
  }

  async updatePassword() {
    if (!this.user) return;

    // Validate passwords
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters';
      return;
    }

    try {
      await this.auth.updatePassword(this.currentPassword, this.newPassword);

      const alert = await this.alertController.create({
        header: 'Success',
        message: 'Password updated successfully',
        buttons: ['OK']
      });
      await alert.present();

      this.showPasswordUpdate = false;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.passwordError = '';
    } catch (error: any) {
      console.error('Error updating password:', error);
      this.passwordError = error.message || 'Failed to update password';
    }
  }
}
