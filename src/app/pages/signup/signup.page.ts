import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { IonHeader, IonCardTitle, IonBackButton, IonToolbar, IonButtons, IonContent, IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonProgressBar, IonText, IonInput } from "@ionic/angular/standalone";

@Component({
	selector: 'app-signup',
	standalone: true,
	imports: [
		IonText,
		IonProgressBar,
		IonIcon,
		IonButton,
		IonCardContent,
		IonCardSubtitle,
		IonCardHeader,
		IonCard,
		IonContent,
		IonButtons,
		IonToolbar,
		IonBackButton,
		IonCardTitle,
		IonHeader,
		IonInput,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule
	],
	templateUrl: './signup.page.html',
	styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
	signupForm: FormGroup;
	loading = false;
	error: string | null = null;
	passwordStrength = 0;

	private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

	constructor(
		private auth: AuthService,
		public router: Router,
		private fb: FormBuilder
	) {
		this.signupForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
			confirmPassword: ['', [Validators.required]]
		});
	}

	ngOnInit() {
		// Subscribe to password changes to update strength
		this.signupForm.get('password')?.valueChanges.subscribe(value => {
			this.onPasswordInput(value);
		});
	}

	async handleGoogleSignIn() {
		this.loading = true;
		try {
			await this.auth.loginWithGoogle();
			this.router.navigate(['/home']);
		} catch (err) {
			console.error('Google sign-in failed', err);
			this.error = 'Google sign-in failed. Please try again.';
		} finally {
			this.loading = false;
		}
	}

	async handleSubmit() {
		if (this.signupForm.invalid) {
			return;
		}

		this.loading = true;
		this.error = null;

		const { email, password, confirmPassword } = this.signupForm.value;

		if (password !== confirmPassword) {
			this.error = 'Passwords do not match.';
			this.loading = false;
			return;
		}

		try {
			await this.auth.signUp(email, password);
			this.router.navigate(['/home']);
		} catch (err) {
			console.error('Sign-up failed', err);
			this.error = 'Sign-up failed. Please try again.';
		} finally {
			this.loading = false;
		}
	}

	onPasswordInput(value: string) {
		let score = 0;
		if (/[a-z]/.test(value)) score++;
		if (/[A-Z]/.test(value)) score++;
		if (/\d/.test(value)) score++;
		if (/[\W_]/.test(value)) score++;
		if (value.length >= 12) score++;
		this.passwordStrength = Math.min(score / 5, 1);
	}

	passwordStrengthLabel(): string {
		if (this.passwordStrength < 0.4) return 'Weak';
		if (this.passwordStrength < 0.8) return 'Medium';
		return 'Strong';
	}
}
