import { Injectable, inject } from '@angular/core';
import { Auth, authState, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private auth = inject(Auth);
	user$: Observable<User | null> = authState(this.auth);

	constructor() { }

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
				return signInWithPopup(this.auth, provider);
			})
			.then((cred) => cred.user);
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
}
