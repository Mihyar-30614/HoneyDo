// src/app/components/home/home.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Project } from '../../models/project.model';
import { Todo } from '../../models/todo.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
	standalone: true,
	imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit {
	user: User | null = null;
	loading = true;

	// Active and Archived lists
	projects: Project[] = [];
	archivedProjects: Project[] = [];
	selectedProject: Project | null = null;

	todos: Todo[] = [];
	archivedTodos: Todo[] = [];

	// Form fields
	newProjectName = '';
	editingProject: Project | null = null;
	editProjectName = '';

	newTodoTitle = '';
	editingTodo: Todo | null = null;
	editTodoTitle = '';

	constructor(
		private auth: AuthService,
		private data: DataService,
		private router: Router
	) { }

	ngOnInit() {
		this.auth.user$.subscribe(u => {
			if (!u) {
				this.router.navigate(['/login']);
			} else {
				this.user = u;
				this.loadProjects();
			}
		});
	}

	// --- Projects ---
	loadProjects() {
		if (!this.user) return;
		this.data.getProjects(this.user.uid).subscribe(list => {
			// separate active and archived
			this.projects = list.filter(p => !p.archived);
			this.archivedProjects = list.filter(p => p.archived);
			this.loading = false;

			// keep selected if still active
			if (this.selectedProject) {
				const activeMatch = this.projects.find(p => p.id === this.selectedProject!.id);
				if (!activeMatch) this.selectedProject = null;
			}
		});
	}

	selectProject(p: Project) {
		this.selectedProject = p;
		this.loadTodos(p.id);
	}

	addProject() {
		if (!this.newProjectName.trim() || !this.user) return;
		this.data
			.addProject(this.newProjectName, this.user.uid)
			.then(() => (this.newProjectName = ''));
	}

	editProj(p: Project) {
		this.editingProject = p;
		this.editProjectName = p.name;
	}

	updateProject() {
		if (!this.editingProject || !this.editProjectName.trim()) return;
		this.data
			.updateProject(this.editingProject.id, { name: this.editProjectName })
			.then(() => {
				this.editingProject = null;
				this.editProjectName = '';
			});
	}

	cancelProjectEdit() {
		this.editingProject = null;
		this.editProjectName = '';
	}

	archiveProject(id: string) {
		this.data.updateProject(id, { archived: true });
		if (this.selectedProject?.id === id) {
			this.selectedProject = null;
			this.todos = [];
		}
	}

	unarchiveProject(id: string) {
		this.data.updateProject(id, { archived: false });
	}

	// --- Todos ---
	loadTodos(projectId: string) {
		this.data.getTodos(projectId).subscribe(list => {
			this.todos = list.filter(t => !t.archived);
			this.archivedTodos = list.filter(t => t.archived);
		});
	}

	addTodo() {
		if (!this.newTodoTitle.trim() || !this.selectedProject) return;
		this.data
			.addTodo(this.newTodoTitle, this.selectedProject.id)
			.then(() => (this.newTodoTitle = ''));
	}

	toggleTodo(t: Todo) {
		this.data.updateTodo(t.id, { completed: !t.completed });
	}

	editT(t: Todo) {
		this.editingTodo = t;
		this.editTodoTitle = t.title;
	}

	updateTodo() {
		if (!this.editingTodo || !this.editTodoTitle.trim()) return;
		this.data
			.updateTodo(this.editingTodo.id, { title: this.editTodoTitle })
			.then(() => {
				this.editingTodo = null;
				this.editTodoTitle = '';
			});
	}

	cancelTodoEdit() {
		this.editingTodo = null;
		this.editTodoTitle = '';
	}

	archiveTodo(id: string) {
		this.data.updateTodo(id, { archived: true });
	}

	unarchiveTodo(id: string) {
		this.data.updateTodo(id, { archived: false });
	}

	deleteTodo(id: string) {
		this.data.deleteTodo(id);
	}

	// --- Logout ---
	logout() {
		this.auth.logout().then(() => this.router.navigate(['/login']));
	}
}
