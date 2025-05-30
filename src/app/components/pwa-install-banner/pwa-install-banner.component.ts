import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-pwa-install-banner',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="pwa-install-banner" role="alert" aria-live="polite">
			<span>
				<span class="desktop-only">Get the full HoneyDo experience - </span>
				Install HoneyDo for quick access and offline use
			</span>
			<button (click)="onInstall()" class="install-btn" aria-label="Install HoneyDo App">Install App</button>
			<button (click)="onClose()" class="close-btn" aria-label="Close install banner">×</button>
		</div>
	`,
	styles: [`
		.pwa-install-banner {
			position: fixed;
			bottom: 24px;
			left: 50%;
			transform: translateX(-50%);
			background: var(--ion-color-light);
			color: var(--ion-color-dark);
			border: 2px solid var(--ion-color-warning);
			border-radius: 16px;
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
			padding: 1.25rem 1.5rem;
			display: flex;
			align-items: center;
			gap: 1rem;
			z-index: 999999;
			font-size: 1rem;
			max-width: 90%;
			width: 400px;
			animation: slideUp 0.3s ease-out;
			pointer-events: auto;

			@media (min-width: 900px) {
				width: 500px;
				font-size: 1.1rem;
				padding: 1.5rem 2rem;
				bottom: 32px;
				right: 32px;
				left: auto;
				transform: none;
			}

			span {
				flex: 1;
				font-weight: 500;

				.desktop-only {
					display: none;
				}

				@media (min-width: 900px) {
					.desktop-only {
						display: inline;
					}
				}
			}

			button {
				background: var(--ion-color-warning);
				color: var(--ion-color-warning-contrast);
				border: none;
				border-radius: 8px;
				padding: 0.75rem 1.25rem;
				font-weight: 600;
				cursor: pointer;
				transition: all 0.2s ease;
				white-space: nowrap;

				&:hover {
					background: var(--ion-color-warning-shade);
					transform: translateY(-1px);
				}

				&:active {
					transform: translateY(0);
				}

				@media (min-width: 900px) {
					padding: 0.875rem 1.5rem;
					font-size: 1.1rem;
				}
			}

			.close-btn {
				background: transparent;
				color: var(--ion-color-medium);
				font-size: 1.5rem;
				border: none;
				padding: 0.25rem;
				cursor: pointer;
				transition: color 0.2s;
				line-height: 1;

				&:hover {
					color: var(--ion-color-dark);
				}

				@media (min-width: 900px) {
					font-size: 1.75rem;
					padding: 0.5rem;
				}
			}
		}

		@keyframes slideUp {
			from {
				transform: translate(-50%, 100%);
				opacity: 0;
			}
			to {
				transform: translate(-50%, 0);
				opacity: 1;
			}
		}

		@media (min-width: 900px) {
			@keyframes slideUp {
				from {
					transform: translateY(100%);
					opacity: 0;
				}
				to {
					transform: translateY(0);
					opacity: 1;
				}
			}
		}
	`]
})
export class PwaInstallBannerComponent {
	@Input() show = false;
	@Output() install = new EventEmitter<void>();
	@Output() close = new EventEmitter<void>();

	onInstall() {
		this.install.emit();
	}

	onClose() {
		this.close.emit();
	}
}
