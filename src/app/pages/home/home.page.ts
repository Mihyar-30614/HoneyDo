import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Project } from '../../models/project.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectFilterPipe } from './project-filter.pipe';
import { Timestamp } from 'firebase/firestore';
import {
	IonHeader,
	IonToolbar,
	IonTitle,
	IonButtons,
	IonButton,
	IonIcon,
	IonContent,
	IonList,
	IonItem,
	IonLabel,
	IonBadge,
	IonInput,
	IonTextarea,
	IonGrid,
	IonRow,
	IonCol,
	IonProgressBar,
	IonSearchbar,
	IonModal,
	IonFab,
	IonFabButton,
	IonCardTitle,
	IonCard,
	IonCardContent,
	IonCardHeader,
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
	standalone: true,
	imports: [
		IonCardHeader,
		IonCardContent,
		IonCard,
		IonCardTitle,
		CommonModule,
		FormsModule,
		ProjectFilterPipe,
		IonTitle,
		IonProgressBar,
		IonCol,
		IonRow,
		IonGrid,
		IonLabel,
		IonIcon,
		IonItem,
		IonList,
		IonButtons,
		IonHeader,
		IonToolbar,
		IonContent,
		IonButton,
		IonSearchbar,
		IonInput,
		IonTextarea,
		IonModal,
		IonFab,
		IonFabButton
	],
})
export class HomePage implements OnInit {
	user: User | null = null;
	userInitials: string = '';
	userMenuOpen = false;
	userMenuEvent: any = null;
	loading = true;

	// Project data
	projects: Project[] = [];
	archivedProjects: Project[] = [];

	// Form state
	projectSearch = '';
	newProjectName = '';
	newProjectDescription: string = '';
	editingProject: Project | null = null;
	editProjectName = '';
	editProjectDescription: string = '';
	showAddProjectModal = false;

	constructor(
		private auth: AuthService,
		private data: DataService,
		private router: Router,
		private alertController: AlertController
	) { }

	ngOnInit(): void {
		this.auth.user$.subscribe(u => {
			if (!u) {
				this.router.navigate(['/login']);
			} else {
				this.user = u;
				this.userInitials = this.generateInitials(u);
				this.loadProjects();
			}
		});
	}

	generateInitials(user: User): string {
		if (user.displayName) {
			return user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
		} else if (user.email) {
			const parts = user.email.split(/[@.]/).filter(Boolean);
			if (parts.length >= 2) {
				return (parts[0][0] + parts[1][0]).toUpperCase();
			}
			return user.email[0].toUpperCase();
		}
		return '?';
	}

	// --- User Menu ---
	toggleUserMenu(): void { this.userMenuOpen = !this.userMenuOpen; }

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		const clickedInside = (event.target as HTMLElement)?.closest('.user-dropdown, .avatar-button');
		if (!clickedInside) {
			this.userMenuOpen = false;
		}
	}

	openUserMenu(event: any) {
		event.stopPropagation();
		this.userMenuOpen = true;
		this.userMenuEvent = event;
	}

	closeUserMenu() {
		this.userMenuOpen = false;
		this.userMenuEvent = null;
	}

	editProfile(): void {
		this.router.navigate(['/profile']);
		this.closeUserMenu();
	}

	logout(): void { this.auth.logout().then(() => this.router.navigate(['/login'])); }

	// --- Projects ---
	loadProjects(): void {
		if (!this.user) return;
		this.data.getProjects(this.user.uid).subscribe({
			next: (list) => {
				// Convert Firestore Timestamp to JS Date for createdAt
				this.projects = list.filter(p => !p.archived).map(p => ({
					...p,
					createdAt: p.createdAt instanceof Timestamp ? p.createdAt.toDate() : p.createdAt,
					progress: 0 // Initialize progress
				}));
				this.archivedProjects = list.filter(p => p.archived).map(p => ({
					...p,
					createdAt: p.createdAt instanceof Timestamp ? p.createdAt.toDate() : p.createdAt,
					progress: 0 // Initialize progress
				}));

				// Calculate progress for each project
				const allProjects = [...this.projects, ...this.archivedProjects];
				allProjects.forEach(project => {
					this.data.getTodos(project.id).subscribe(todos => {
						const totalTodos = todos.length;
						if (totalTodos === 0) {
							project.progress = 0;
							return;
						}

						const completedTodos = todos.filter(todo => todo.status === 'done').length;
						project.progress = Math.round((completedTodos / totalTodos) * 100);
					});
				});

				this.loading = false;
			},
			error: (error) => {
				console.error('Error loading projects:', error);
				this.loading = false;
			}
		});
	}

	selectProject(p: Project): void {
		this.router.navigate(['/todo', p.id]);
	}

	addProject(): void {
		if (!this.newProjectName.trim() || !this.user) return;
		this.data
			.addProject(this.newProjectName, this.user.uid, this.newProjectDescription)
			.then(() => {
				this.newProjectName = '';
				this.newProjectDescription = '';
			});
	}

	editProj(p: Project): void {
		this.editingProject = p;
		this.editProjectName = p.name;
		this.editProjectDescription = p.description || '';
	}

	updateProject(): void {
		if (!this.editingProject || !this.editProjectName.trim() || !this.user) return;

		// Create update object with all required fields
		const updateData = {
			name: this.editProjectName,
			description: this.editProjectDescription,
			ownerId: this.user.uid, // Include ownerId in updates
			archived: this.editingProject.archived || false
		};

		this.data
			.updateProject(this.editingProject.id, updateData, this.user.uid)
			.then(() => {
				this.editingProject = null;
				this.editProjectName = '';
				this.editProjectDescription = '';
			})
			.catch(error => {
				console.error('Error updating project:', error);
			});
	}

	cancelProjectEdit(): void {
		this.editingProject = null;
		this.editProjectName = '';
	}

	archiveProject(id: string): void {
		if (!this.user) return;
		const project = this.projects.find(p => p.id === id);
		if (!project) return;

		const updateData = {
			archived: true,
			ownerId: this.user.uid, // Include ownerId in updates
			name: project.name,
			description: project.description || ''
		};

		this.data.updateProject(id, updateData, this.user.uid)
			.catch(error => {
				console.error('Error archiving project:', error);
			});
	}

	unarchiveProject(id: string): void {
		if (!this.user) return;
		const project = this.archivedProjects.find(p => p.id === id);
		if (!project) return;

		const updateData = {
			archived: false,
			ownerId: this.user.uid, // Include ownerId in updates
			name: project.name,
			description: project.description || ''
		};

		this.data.updateProject(id, updateData, this.user.uid)
			.catch(error => {
				console.error('Error unarchiving project:', error);
			});
	}

	async confirmDelete(project: Project) {
		const alert = await this.alertController.create({
			header: 'Delete Project',
			message: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					cssClass: 'secondary'
				},
				{
					text: 'Delete',
					role: 'destructive',
					handler: () => {
						this.deleteProject(project.id);
					}
				}
			]
		});

		await alert.present();
	}

	private deleteProject(id: string): void {
		this.data.deleteProject(id)
			.then(() => {
				// Project will be removed from the list automatically through the subscription
			})
			.catch(error => {
				console.error('Error deleting project:', error);
			});
	}
}
