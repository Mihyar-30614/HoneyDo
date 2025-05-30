import { Component, NgZone } from '@angular/core';
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
export class AppComponent {
	deferredPrompt: any = null;
	showInstallBanner = false;
	private hasInteracted = false;
	private isStandalone = false;

	constructor(
		private router: Router,
		private auth: AuthService,
		private ngZone: NgZone
	) {
		addIcons(allIcons);

		// Check if app is already installed
		this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone ||
			document.referrer.includes('android-app://');

		// Listen for beforeinstallprompt event
		window.addEventListener('beforeinstallprompt', (e) => {
			this.deferredPrompt = e;
			if (this.hasInteracted) {
				this.ngZone.run(() => {
					this.showInstallBanner = true;
				});
			}
		});

		// Check if the app is installable
		this.checkInstallable();

		// Listen for successful login
		this.auth.user$.subscribe(user => {
			if (user) {
				this.startInteractionTimer();
			}
		});

		// Track navigation to protected routes
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe((event: any) => {
			if (event.url === '/home' || event.url.startsWith('/todo/')) {
				this.hasInteracted = true;
				this.checkShowInstallBanner();
			}
		});

		// Listen for appinstalled event
		window.addEventListener('appinstalled', () => {
			this.isStandalone = true;
			this.ngZone.run(() => {
				this.showInstallBanner = false;
			});
		});
	}

	private async checkInstallable() {
		if (this.isStandalone) {
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

	private checkShowInstallBanner() {
		if (this.isStandalone || !this.deferredPrompt) {
			return;
		}

		if (this.hasInteracted && !this.showInstallBanner) {
			this.ngZone.run(() => {
				this.showInstallBanner = true;
			});
		}
	}

	async onInstallPwa() {
		if (this.deferredPrompt) {
			try {
				await this.deferredPrompt.prompt();
				const choiceResult = await this.deferredPrompt.userChoice;
				if (choiceResult.outcome === 'accepted') {
					this.isStandalone = true;
				}
			} catch (error) {
				// Silently handle error
			} finally {
				this.deferredPrompt = null;
				this.ngZone.run(() => {
					this.showInstallBanner = false;
				});
			}
		}
	}

	closeBanner() {
		this.ngZone.run(() => {
			this.showInstallBanner = false;
		});
		this.deferredPrompt = null;
	}
}
