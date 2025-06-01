import { Injectable, inject } from '@angular/core';
import { Auth, authState, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, setPersistence, browserLocalPersistence, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, getRedirectResult, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from '@angular/fire/auth';
import { Observable, BehaviorSubject, from } from 'rxjs';

function isSafariOrStandalone(): boolean {
	const ua = window.navigator.userAgent;
	const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
	const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
	return isSafari || isStandalone;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private auth = inject(Auth);
	user$: Observable<User | null> = authState(this.auth);

	constructor() {
		// Check for redirect result on service initialization
		this.handleGoogleRedirect().catch(error => {
			console.error('Error handling redirect:', error);
		});
	}

	private async setPersistence(): Promise<void> {
		try {
			await setPersistence(this.auth, browserLocalPersistence);
		} catch (error) {
			console.error('Error setting persistence:', error);
		}
	}

	signUp(email: string, password: string): Promise<User> {
		return this.setPersistence()
			.then(() => createUserWithEmailAndPassword(this.auth, email, password))
			.then((cred) => cred.user);
	}

	login(email: string, password: string): Promise<User> {
		return this.setPersistence()
			.then(() => signInWithEmailAndPassword(this.auth, email, password))
			.then((cred) => cred.user);
	}

	loginWithGoogle(): Promise<User> {
		return this.setPersistence()
			.then(() => {
				const provider = new GoogleAuthProvider();
				// Always use redirect for mobile/PWA
				if (isSafariOrStandalone() || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
					return signInWithRedirect(this.auth, provider).then(() => {
						// The redirect will leave the page, so this promise never resolves to a user here
						return new Promise<User>(() => {}); // never resolves, but required for typing
					});
				} else {
					return signInWithPopup(this.auth, provider).then(cred => cred.user);
				}
			});
	}

	async handleGoogleRedirect(): Promise<User | null> {
		try {
			const result = await getRedirectResult(this.auth);
			if (result?.user) {
				return result.user;
			}
			return null;
		} catch (error) {
			console.error('Error handling redirect:', error);
			return null;
		}
	}

	logout(): Promise<void> {
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
			// Re-authenticate user before changing password
			const credential = EmailAuthProvider.credential(user.email, currentPassword);
			await reauthenticateWithCredential(user, credential);

			// Update password
			await updatePassword(user, newPassword);
		} catch (error) {
			throw error;
		}
	}

	sendPasswordResetEmail(email: string): Promise<void> {
		return firebaseSendPasswordResetEmail(this.auth, email);
	}
}
