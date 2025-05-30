import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	imports: [IonApp, IonRouterOutlet, CommonModule],
})
export class AppComponent {
	deferredPrompt: any = null;
	showInstallBanner = false;

	constructor() {
		addIcons(allIcons);
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			this.deferredPrompt = e;
			this.showInstallBanner = true;
		});
	}

	onInstallPwa() {
		if (this.deferredPrompt) {
			this.deferredPrompt.prompt();
			this.deferredPrompt.userChoice.then(() => {
				this.deferredPrompt = null;
				this.showInstallBanner = false;
			});
		}
	}

	closeBanner() {
		this.showInstallBanner = false;
	}
}
