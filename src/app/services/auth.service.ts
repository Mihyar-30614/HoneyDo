import { Injectable, inject } from '@angular/core';
import {
	Auth,
	authState,
	signOut,
	User,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	signInWithRedirect,
	getRedirectResult,
	setPersistence,
	browserLocalPersistence,
	updateProfile,
	updatePassword,
	EmailAuthProvider,
	reauthenticateWithCredential,
	sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from '@angular/fire/auth';
import { Observable, BehaviorSubject, from } from 'rxjs';

function isIos(): boolean {
	return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isPwa(): boolean {
	return window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as any).standalone ||
		document.referrer.includes('android-app://');
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private auth = inject(Auth);
	user$: Observable<User | null> = authState(this.auth);
	private currentUser = new BehaviorSubject<User | null>(null);

	constructor() {
		// Initialize auth state
		this.auth.onAuthStateChanged((user) => {
			this.currentUser.next(user);
		});
	}

	async initializeAuth() {
		try {
			// Set persistence to LOCAL
			await setPersistence(this.auth, browserLocalPersistence);

			// Check for redirect result
			const result = await getRedirectResult(this.auth);
			if (result?.user) {
				this.currentUser.next(result.user);
				return result.user;
			}
		} catch (error) {
			console.error('Auth initialization error:', error);
		}
		return null;
	}

	signUp(email: string, password: string): Promise<User> {
		return createUserWithEmailAndPassword(this.auth, email, password)
			.then((cred) => cred.user);
	}

	login(email: string, password: string): Promise<User> {
		return signInWithEmailAndPassword(this.auth, email, password)
			.then((cred) => cred.user);
	}

	async loginWithGoogle(): Promise<void> {
		const provider = new GoogleAuthProvider();

		// For iOS and PWA, always use redirect
		if (isIos() || isPwa()) {
			await signInWithRedirect(this.auth, provider);
			return;
		}

		try {
			// For other platforms, try popup first
			const result = await signInWithPopup(this.auth, provider);
			this.currentUser.next(result.user);
		} catch (error) {
			console.error('Popup failed, trying redirect:', error);
			// Fallback to redirect
			await signInWithRedirect(this.auth, provider);
		}
	}

	async handleGoogleRedirect(): Promise<User | null> {
		try {
			const result = await getRedirectResult(this.auth);
			if (result?.user) {
				this.currentUser.next(result.user);
				return result.user;
			}
		} catch (error) {
			console.error('Redirect error:', error);
		}
		return null;
	}

	logout(): Promise<void> {
		this.currentUser.next(null);
		return signOut(this.auth);
	}

	updateProfile(data: { displayName?: string }) {
		const user = this.auth.currentUser;
		if (!user) throw new Error('No user logged in');
		return updateProfile(user, data);
	}

	async updatePassword(currentPassword: string, newPassword: string) {
		const user = this.auth.currentUser;
		if (!user || !user.email) throw new Error('No user logged in');

		try {
			const credential = EmailAuthProvider.credential(user.email, currentPassword);
			await reauthenticateWithCredential(user, credential);
			await updatePassword(user, newPassword);
		} catch (error) {
			throw error;
		}
	}

	sendPasswordResetEmail(email: string): Promise<void> {
		return firebaseSendPasswordResetEmail(this.auth, email);
	}

	getCurrentUser(): User | null {
		return this.currentUser.value;
	}
}
