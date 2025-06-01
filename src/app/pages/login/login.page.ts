import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import {
	IonHeader,
	IonToolbar,
	IonButtons,
	IonBackButton,
	IonContent,
	IonCard,
	IonCardHeader,
	IonCardTitle,
	IonCardSubtitle,
	IonCardContent,
	IonButton,
	IonInput,
	IonText,
	IonInputPasswordToggle,
	IonIcon
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		IonHeader,
		IonToolbar,
		IonButtons,
		IonBackButton,
		IonContent,
		IonCard,
		IonCardHeader,
		IonCardTitle,
		IonCardSubtitle,
		IonCardContent,
		IonButton,
		IonInput,
		IonText,
		IonInputPasswordToggle,
		IonIcon
	],
})
export class LoginPage implements OnInit {
	email: string = '';
	password: string = '';
	loading: boolean = false;
	error: string | null = null;

	constructor(
		private auth: AuthService,
		public router: Router
	) { }

	async ngOnInit() {
		this.loading = true;
		try {
			const currentUser = this.auth.getCurrentUser();
		} catch (err) {
			// Handle error silently
			console.error(err)
		} finally {
			this.loading = false;
		}
	}

	async handleSubmit() {
		this.loading = true;
		this.error = null;
		try {
			await this.auth.login(this.email, this.password);
		} catch (err) {
			this.error = 'Invalid email or password. Please try again.';
		} finally {
			this.loading = false;
		}
	}

	async handleGoogleSignIn() {
		this.loading = true;
		this.error = null;
		try {
			await this.auth.loginWithGoogle();
		} catch (err) {
			this.error = 'Google sign-in failed. Please try again.';
		} finally {
			this.loading = false;
		}
	}
}
