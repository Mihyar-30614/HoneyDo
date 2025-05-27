import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Project } from '../../models/project.model';
import { Todo } from '../../models/todo.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectFilterPipe } from './project-filter.pipe';
import { OrderByPipe } from '../../pipes/order-by.pipe';
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
} from '@ionic/angular/standalone';


@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ProjectFilterPipe,
		OrderByPipe,
		IonBadge,
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
	],
})
export class HomePage implements OnInit {
	user: User | null = null;
	userInitials: string = '';
	userMenuOpen = false;
	userMenuEvent: any = null;
	loading = true;
	viewState: 'projects' | 'todos' = 'projects';

	// Project and Todo data
	projects: Project[] = [];
	archivedProjects: Project[] = [];
	selectedProject: Project | null = null;
	todos: Todo[] = [];
	archivedTodos: Todo[] = [];

	// Form state
	projectSearch = '';
	newProjectName = '';
	newProjectDescription: string = '';
	editingProject: Project | null = null;
	editProjectName = '';
	editProjectDescription: string = '';
	newTodoTitle = '';
	editingTodo: Todo | null = null;
	editTodoTitle = '';

	constructor(
		private auth: AuthService,
		private data: DataService,
		private router: Router
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
			return user.displayName
				.split(' ')
				.map(n => n[0])
				.join('')
				.substring(0, 2)
				.toUpperCase();
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
		// Implement profile editing logic or navigation here
		alert('Edit Profile clicked!');
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

				// Load todos for each project to calculate progress
				const allProjects = [...this.projects, ...this.archivedProjects];
				allProjects.forEach(project => {
					this.data.getTodos(project.id).subscribe(todos => {
						const total = todos.length;
						const done = todos.filter(t => t.status === 'done').length;
						project.progress = total === 0 ? 0 : done / total;
					});
				});

				if (this.selectedProject && !this.projects.find(p => p.id === this.selectedProject?.id)) {
					this.selectedProject = null;
				}
				this.loading = false;
			},
			error: (error) => {
				console.error('Error loading projects:', error);
				this.loading = false;
			}
		});
	}

	selectProject(p: Project): void {
		this.selectedProject = p;
		this.loadTodos(p.id);
		this.viewState = 'todos';
	}

	backToProjects(): void {
		this.viewState = 'projects';
		this.selectedProject = null;
		this.todos = [];
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

		if (this.selectedProject?.id === id) {
			this.selectedProject = null;
			this.todos = [];
		}
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

	// --- Todos ---
	loadTodos(projectId: string): void {
		this.data.getTodos(projectId).subscribe(list => {
			this.todos = list.filter(t => !t.archived);
			this.archivedTodos = list.filter(t => t.archived);

			// Update project progress
			const project = this.projects.find(p => p.id === projectId) || this.archivedProjects.find(p => p.id === projectId);
			if (project) {
				const total = this.todos.length;
				const done = this.todos.filter(t => t.status === 'done').length;
				project.progress = total === 0 ? 0 : done / total;
			}
		});
	}

	addTodo(): void {
		if (!this.newTodoTitle.trim() || !this.selectedProject) return;
		this.data.addTodo(this.newTodoTitle, this.selectedProject.id, 'new')
			.then(() => this.newTodoTitle = '');
	}

	editT(t: Todo): void {
		this.editingTodo = t;
		this.editTodoTitle = t.title;
	}

	updateTodo(): void {
		if (!this.editingTodo || !this.editTodoTitle.trim()) return;
		this.data.updateTodo(this.editingTodo.id, { title: this.editTodoTitle })
			.then(() => {
				this.editingTodo = null;
				this.editTodoTitle = '';
			});
	}

	cancelTodoEdit(): void {
		this.editingTodo = null;
		this.editTodoTitle = '';
	}

	archiveTodo(id: string): void {
		this.data.updateTodo(id, { archived: true });
	}

	unarchiveTodo(id: string): void {
		this.data.updateTodo(id, { archived: false });
	}

	deleteTodo(id: string): void {
		this.data.deleteTodo(id);
	}

	updateTodoStatus(t: Todo): void {
		this.data.updateTodo(t.id, { status: t.status });
	}

	cycleStatus(t: Todo): void {
		const order: ('new' | 'in-progress' | 'done')[] = ['new', 'in-progress', 'done'];
		const currentIndex = order.indexOf(t.status);
		const nextStatus: 'new' | 'in-progress' | 'done' = order[(currentIndex + 1) % order.length];
		t.status = nextStatus;
		this.data.updateTodo(t.id, { status: nextStatus });
	}


	calculateProgress(): number {
		const total = this.todos.length;
		const done = this.todos.filter(t => t.status === 'done').length;
		return total === 0 ? 0 : done / total;
	}

	get doneCount(): number {
		return this.todos.filter(t => t.status === 'done').length;
	}

	get newTodosCount(): number {
		return this.todos.filter(t => t.status === 'new').length;
	}

	get inProgressTodosCount(): number {
		return this.todos.filter(t => t.status === 'in-progress').length;
	}

	get doneTodosCount(): number {
		return this.todos.filter(t => t.status === 'done').length;
	}

}
