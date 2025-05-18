import { Injectable, inject } from '@angular/core';
import { Auth, authState, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private auth = inject(Auth);
	user$: Observable<User | null> = authState(this.auth);

	signUp(email: string, password: string): Promise<User> {
		return createUserWithEmailAndPassword(this.auth, email, password)
			.then((cred) => cred.user);
	}

	signIn(email: string, password: string): Promise<User> {
		return signInWithEmailAndPassword(this.auth, email, password)
			.then((cred) => cred.user);
	}

	signInWithGoogle(): Promise<User> {
		const provider = new GoogleAuthProvider();
		return signInWithPopup(this.auth, provider)
			.then((cred) => cred.user);
	}

	logout(): Promise<void> {
		return signOut(this.auth);
	}
}
