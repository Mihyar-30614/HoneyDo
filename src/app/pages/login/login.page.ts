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
		private router: Router
	) { }

	async ngOnInit() {
		// Handle Google redirect result (for Safari/PWA)
		this.loading = true;
		try {
			const user = await this.auth.handleGoogleRedirect();
			if (user) {
				this.router.navigate(['/home']);
				return;
			}
		} catch (err) {
			this.error = 'Google sign-in failed. Please try again.';
		} finally {
			this.loading = false;
		}
	}

	async handleSubmit() {
		this.loading = true;
		this.error = null;
		try {
			await this.auth.login(this.email, this.password);
			this.router.navigate(['/home']);
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
			this.router.navigate(['/home']);
		} catch (err) {
			this.error = 'Google sign-in failed. Please try again.';
		} finally {
			this.loading = false;
		}
	}
}
