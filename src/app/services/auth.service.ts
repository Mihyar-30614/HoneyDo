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
	setPersistence,
	browserLocalPersistence,
	updateProfile,
	updatePassword,
	EmailAuthProvider,
	reauthenticateWithCredential,
	sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';

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

			const currentUser = this.auth.currentUser;
			if (currentUser) {
				this.currentUser.next(currentUser);
				return currentUser;
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
		try {
			const result = await signInWithPopup(this.auth, provider);
			this.currentUser.next(result.user);
		} catch (error) {
			throw error;
		}
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
