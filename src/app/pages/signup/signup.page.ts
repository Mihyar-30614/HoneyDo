import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonButton, IonInput, IonItem, IonLabel, IonText, IonBackButton, IonButtons } from '@ionic/angular/standalone';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonButton, IonInput, IonItem, IonLabel, IonText, IonBackButton, IonButtons,
    CommonModule, FormsModule
  ]
})
export class SignupPage implements OnInit {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string | null = null;

  constructor() {}

  ngOnInit() {}

  handleSubmit() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    // Add logic to handle signup with Firebase Authentication
    console.log('Signup successful with email:', this.email);
  }
}
