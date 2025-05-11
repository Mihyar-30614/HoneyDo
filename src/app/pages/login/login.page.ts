import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Auth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
	standalone: true,
	imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class LoginPage implements OnInit {
	email: string = '';
	password: string = '';
	loading: boolean = false;
	error: string | null = null;

	constructor(private auth: Auth, private router: Router) { }

	ngOnInit() { }

	async handleSubmit() {
		this.loading = true;
		this.error = null;
		try {
			await signInWithEmailAndPassword(this.auth, this.email, this.password);
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
			const provider = new GoogleAuthProvider();
			await signInWithPopup(this.auth, provider);
			this.router.navigate(['/home']);
		} catch (err) {
			this.error = 'Google sign-in failed. Please try again.';
		} finally {
			this.loading = false;
		}
	}
}
