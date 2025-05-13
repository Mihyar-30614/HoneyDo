import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Project } from '../../models/project.model';
import { Todo } from '../../models/todo.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProjectFilterPipe } from './project-filter.pipe';
import { Timestamp } from 'firebase/firestore';

@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
	standalone: true,
	imports: [IonicModule, CommonModule, FormsModule, ProjectFilterPipe],
})
export class HomePage implements OnInit {
	user: User | null = null;
	userInitials: string = '';
	userMenuOpen = false;
	userMenuEvent: any = null;
	loading = true;

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
		this.data.getProjects(this.user.uid).subscribe(list => {
			// Convert Firestore Timestamp to JS Date for createdAt
			this.projects = list.filter(p => !p.archived).map(p => ({
				...p,
				createdAt: p.createdAt instanceof Timestamp ? p.createdAt.toDate() : p.createdAt
			}));
			this.archivedProjects = list.filter(p => p.archived).map(p => ({
				...p,
				createdAt: p.createdAt instanceof Timestamp ? p.createdAt.toDate() : p.createdAt
			}));
			this.loading = false;

			if (this.selectedProject && !this.projects.find(p => p.id === this.selectedProject?.id)) {
				this.selectedProject = null;
			}
		});
	}

	selectProject(p: Project): void {
		this.selectedProject = p;
		this.loadTodos(p.id);
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
		if (!this.editingProject || !this.editProjectName.trim()) return;
		this.data
			.updateProject(this.editingProject.id, { name: this.editProjectName, description: this.editProjectDescription })
			.then(() => {
				this.editingProject = null;
				this.editProjectName = '';
				this.editProjectDescription = '';
			});
	}

	cancelProjectEdit(): void {
		this.editingProject = null;
		this.editProjectName = '';
	}

	archiveProject(id: string): void {
		this.data.updateProject(id, { archived: true });
		if (this.selectedProject?.id === id) {
			this.selectedProject = null;
			this.todos = [];
		}
	}

	unarchiveProject(id: string): void {
		this.data.updateProject(id, { archived: false });
	}

	// --- Todos ---
	loadTodos(projectId: string): void {
		this.data.getTodos(projectId).subscribe(list => {
			this.todos = list.filter(t => !t.archived);
			this.archivedTodos = list.filter(t => t.archived);
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

}
