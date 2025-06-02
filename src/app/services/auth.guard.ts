import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
	const router = inject(Router);
	const authService = inject(AuthService);

	return authService.user$.pipe(
		map(user => {
			if (user) {
				return true;
			} else {
				router.navigate(['/login']);
				return false;
			}
		})
	);
};
