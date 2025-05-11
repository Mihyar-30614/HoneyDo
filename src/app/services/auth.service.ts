// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Auth, authState, signOut, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private auth = inject(Auth);
	user$: Observable<User | null> = authState(this.auth);

	logout(): Promise<void> {
		return signOut(this.auth);
	}
}
