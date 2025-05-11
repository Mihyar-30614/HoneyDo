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

	projects: Project[] = [];
	selectedProject: Project | null = null;
	newProjectName = '';
	editingProject: Project | null = null;
	editProjectName = '';

	todos: Todo[] = [];
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
			this.projects = list;
			this.loading = false;
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
			.updateProject(this.editingProject.id, this.editProjectName)
			.then(() => {
				this.editingProject = null;
				this.editProjectName = '';
			});
	}

	cancelProjectEdit() {
		this.editingProject = null;
		this.editProjectName = '';
	}

	deleteProject(id: string) {
		this.data.deleteProject(id).then(() => {
			if (this.selectedProject?.id === id) {
				this.selectedProject = null;
				this.todos = [];
			}
		});
	}

	// --- Todos ---
	loadTodos(projectId: string) {
		this.data.getTodos(projectId).subscribe(list => (this.todos = list));
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

	deleteTodo(id: string) {
		this.data.deleteTodo(id);
	}

	// --- Logout ---
	logout() {
		this.auth.logout().then(() => this.router.navigate(['/login']));
	}
}
