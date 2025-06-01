import { Component, NgZone, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { PwaInstallBannerComponent } from './components/pwa-install-banner/pwa-install-banner.component';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	imports: [IonApp, IonRouterOutlet, CommonModule, PwaInstallBannerComponent],
})
export class AppComponent implements OnInit {
	deferredPrompt: any = null;
	showInstallBanner = false;
	public isIos = false;
	private hasInteracted = false;
	private isStandalone = false;

	constructor(
		private router: Router,
		private auth: AuthService,
		private ngZone: NgZone
	) {
		addIcons(allIcons);

		this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone ||
			document.referrer.includes('android-app://');

		this.isIos = this.checkIos();

		window.addEventListener('beforeinstallprompt', (e) => {
			if (this.isIos) return; // iOS never fires this
			this.deferredPrompt = e;
			if (this.hasInteracted) {
				this.ngZone.run(() => {
					this.showInstallBanner = true;
				});
			}
		});

		this.checkInstallable();

		// Handle auth state changes
		this.auth.user$.subscribe(user => {
			if (user) {
				this.startInteractionTimer();
				// Only navigate if we're on the login page
				if (this.router.url === '/login') {
					this.router.navigate(['/home']);
				}
			} else {
				// Only navigate to login if we're not already there
				if (this.router.url !== '/login') {
					this.router.navigate(['/login']);
				}
			}
		});

		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe((event: any) => {
			if (event.url === '/home' || event.url.startsWith('/todo/')) {
				this.hasInteracted = true;
				this.checkShowInstallBanner();
			}
		});

		window.addEventListener('appinstalled', () => {
			this.isStandalone = true;
			this.ngZone.run(() => {
				this.showInstallBanner = false;
			});
		});
	}

	async ngOnInit() {
		// Initialize auth and handle any pending redirects
		await this.auth.initializeAuth();
	}

	private checkIos(): boolean {
		const ua = window.navigator.userAgent;
		return /iphone|ipad|ipod/i.test(ua) && (typeof window === 'undefined' || (window as any).MSStream === undefined);
	}

	private async checkInstallable() {
		if (this.isStandalone) {
			return;
		}
		if (this.isIos) {
			this.ngZone.run(() => {
				this.showInstallBanner = true;
			});
			return;
		}
		if ('getInstalledRelatedApps' in navigator) {
			try {
				const relatedApps = await (navigator as any).getInstalledRelatedApps();
				if (relatedApps.length > 0) {
					return;
				}
			} catch (error) {
				// Silently handle error
			}
		}
		if (this.deferredPrompt && this.hasInteracted) {
			this.ngZone.run(() => {
				this.showInstallBanner = true;
			});
		}
	}

	private startInteractionTimer() {
		setTimeout(() => {
			this.hasInteracted = true;
			this.checkShowInstallBanner();
		}, 30000);
	}

	checkShowInstallBanner() {
		if (this.isStandalone) {
			this.showInstallBanner = false;
			return;
		}
		if (this.isIos) {
			this.showInstallBanner = true;
			return;
		}
		if (this.deferredPrompt) {
			this.showInstallBanner = true;
		}
	}

	onInstallPwa() {
		if (this.isIos) {
			// iOS: show instructions only
			return;
		}
		if (this.deferredPrompt) {
			this.deferredPrompt.prompt();
			this.deferredPrompt.userChoice.then(() => {
				this.showInstallBanner = false;
				this.deferredPrompt = null;
			});
		}
	}

	closeBanner() {
		this.showInstallBanner = false;
	}
}
