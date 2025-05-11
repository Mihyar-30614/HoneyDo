import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
	selector: 'app-signup',
	standalone: true,
	imports: [IonicModule, CommonModule, FormsModule, RouterModule],
	templateUrl: './signup.page.html',
	styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
	email = '';
	password = '';
	confirmPassword = '';
	loading = false;
	error: string | null = null;

	/**
	 * Regex to enforce password complexity:
	 * - Minimum 8 characters
	 * - At least one uppercase letter
	 * - At least one lowercase letter
	 * - At least one number
	 * - At least one special character
	 */
	private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

	constructor(
		private auth: AuthService,
		private router: Router
	) { }

	ngOnInit() { }

	async handleGoogleSignIn() {
		this.loading = true;
		try {
			await this.auth.signInWithGoogle();
			this.router.navigate(['/home']); // ← redirect on social-login
		} catch (err) {
			console.error('Google sign-in failed', err);
			this.error = 'Google sign-in failed. Please try again.';
		} finally {
			this.loading = false;
		}
	}

	async handleSubmit() {
		this.loading = true;
		this.error = null;

		// Check password complexity
		if (!this.passwordPattern.test(this.password)) {
			this.error = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.';
			this.loading = false;
			return;
		}

		// Confirm password match
		if (this.password !== this.confirmPassword) {
			this.error = 'Passwords do not match.';
			this.loading = false;
			return;
		}

		try {
			// Create the new user
			await this.auth.signUp(this.email, this.password);
			// Now the user is authenticated—send them home:
			this.router.navigate(['/home']);
		} catch (err) {
			console.error('Sign-up failed', err);
			this.error = 'Sign-up failed. Please try again.';
		} finally {
			this.loading = false;
		}
	}

	// In SignupPage class
	passwordStrength = 0;  // range 0 to 1

	/** Called on each password change */
	onPasswordInput(value: string) {
		this.password = value;
		let score = 0;
		if (/[a-z]/.test(value)) score++;
		if (/[A-Z]/.test(value)) score++;
		if (/\d/.test(value)) score++;
		if (/[\W_]/.test(value)) score++;
		if (value.length >= 12) score++;
		this.passwordStrength = Math.min(score / 5, 1);
	}

	/** Returns a label based on the current strength */
	passwordStrengthLabel(): string {
		if (this.passwordStrength < 0.4) return 'Weak';
		if (this.passwordStrength < 0.8) return 'Medium';
		return 'Strong';
	}

}
