import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Todo } from '../../models/todo.model';
import { Project } from '../../models/project.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderByPipe } from '../../pipes/order-by.pipe';
import { Subscription } from 'rxjs';
import {
	IonBadge,
	IonTitle,
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
	IonInput,
	IonModal,
	IonFab,
	IonFabButton,
	IonCard,
	IonCardContent,
	IonCheckbox,
	IonPopover,
	IonTextarea,
	IonText,
	IonSelect,
	IonSelectOption,
	ModalController, IonFabList } from '@ionic/angular/standalone';

@Component({
	selector: 'app-todo',
	templateUrl: './todo.page.html',
	styleUrls: ['./todo.page.scss'],
	standalone: true,
	imports: [IonFabList, IonText,
		CommonModule,
		FormsModule,
		OrderByPipe,
		IonBadge,
		IonTitle,
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
		IonInput,
		IonModal,
		IonFab,
		IonFabButton,
		IonCard,
		IonCardContent,
		IonCheckbox,
		IonPopover,
		IonTextarea,
		IonSelect,
		IonSelectOption,
	],
})
export class TodoPage implements OnInit, OnDestroy {
	// User and project data
	user: User | null = null;
	project: Project | null = null;
	todos: Todo[] = [];
	archivedTodos: Todo[] = [];
	loading = true;

	// Form state
	newTodoTitle = '';
	newTodoDescription = '';
	newTodoPriority: 'low' | 'medium' | 'high' = 'medium';
	editingTodo: Todo | null = null;
	editTodoTitle = '';
	editTodoDescription = '';
	editTodoPriority: 'low' | 'medium' | 'high' = 'medium';
	showAddTodoModal = false;
	selectedTodo: Todo | null = null;
	priorityFilter = '';

	// Subscriptions
	private authSubscription: Subscription | null = null;
	private routeSubscription: Subscription | null = null;

	@ViewChild('newTodoInput') newTodoInput?: IonInput;

	constructor(
		private auth: AuthService,
		private data: DataService,
		public router: Router,
		private route: ActivatedRoute,
		public modalCtrl: ModalController
	) { }

	ngOnInit(): void {
		this.initializeAuth();
	}

	ngOnDestroy(): void {
		this.cleanupSubscriptions();
	}

	// Keyboard shortcuts
	@HostListener('document:keydown', ['$event'])
	handleKeyboardEvent(event: KeyboardEvent): void {
		if ((event.ctrlKey || event.metaKey) && event.key === '/') {
			event.preventDefault();
			this.showAddTodoModal = true;
			this.focusNewTodoInput();
		} else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
			event.preventDefault();
			this.addTodo();
		}
	}

	// Initialization
	private initializeAuth(): void {
		this.authSubscription = this.auth.user$.subscribe(u => {
			if (!u) {
				this.router.navigate(['/login']);
			} else {
				this.user = u;
				this.initializeProject();
			}
		});
	}

	private initializeProject(): void {
		this.routeSubscription = this.route.paramMap.subscribe(params => {
			const projectId = params.get('projectId');
			if (projectId) {
				this.loadProject(projectId);
				this.loadTodos(projectId);
			}
		});
	}

	private cleanupSubscriptions(): void {
		if (this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
		if (this.routeSubscription) {
			this.routeSubscription.unsubscribe();
		}
	}

	// Data loading
	private loadProject(projectId: string): void {
		this.project = { id: projectId, name: '', ownerId: '', archived: false };
		this.data.getProjects(this.user!.uid).subscribe(projects => {
			const found = projects.find(p => p.id === projectId);
			if (found) this.project = found;
		});
	}

	private loadTodos(projectId: string): void {
		this.data.getTodos(projectId).then(list => {
			this.todos = list.filter(t => !t.archived);
			this.archivedTodos = list.filter(t => t.archived);
			this.loading = false;
		}).catch(error => {
			console.error('Error loading todos:', error);
			this.loading = false;
		});
	}

	// Todo actions
	addTodo(): void {
		if (!this.newTodoTitle.trim() || !this.project) return;
		this.data.addTodo(this.newTodoTitle, this.project.id, 'new', this.newTodoDescription, this.newTodoPriority)
			.then(() => {
				this.newTodoTitle = '';
				this.newTodoDescription = '';
				this.newTodoPriority = 'medium';
				this.showAddTodoModal = false;
				this.modalCtrl.dismiss();
				// Reload todos after adding
				this.loadTodos(this.project!.id);
			})
			.catch(error => {
				console.error('Error adding todo:', error);
			});
	}

	editT(todo: Todo): void {
		this.editingTodo = todo;
		this.editTodoTitle = todo.title;
		this.editTodoDescription = todo.description || '';
		this.editTodoPriority = todo.priority || 'medium';
	}

	updateTodo(): void {
		if (!this.editingTodo || !this.editTodoTitle.trim() || !this.project) return;
		this.data.updateTodo(this.project.id, this.editingTodo.id, {
			title: this.editTodoTitle,
			description: this.editTodoDescription,
			priority: this.editTodoPriority
		})
			.then(() => {
				this.editingTodo = null;
				this.editTodoTitle = '';
				this.editTodoDescription = '';
				this.editTodoPriority = 'medium';
				this.modalCtrl.dismiss();
				// Reload todos after updating
				this.loadTodos(this.project!.id);
			})
			.catch(error => {
				console.error('Error updating todo:', error);
			});
	}

	cancelTodoEdit(): void {
		this.editingTodo = null;
		this.editTodoTitle = '';
		this.editTodoDescription = '';
		this.editTodoPriority = 'medium';
		this.showAddTodoModal = false;
		this.newTodoTitle = '';
		this.newTodoDescription = '';
		this.newTodoPriority = 'medium';
		this.modalCtrl.dismiss();
	}

	archiveTodo(id: string): void {
		if (!this.project) return;
		this.data.updateTodo(this.project.id, id, { archived: true })
			.then(() => {
				this.loadTodos(this.project!.id);
			})
			.catch(error => {
				console.error('Error archiving todo:', error);
			});
	}

	unarchiveTodo(id: string): void {
		if (!this.project) return;
		this.data.updateTodo(this.project.id, id, { archived: false })
			.then(() => {
				this.loadTodos(this.project!.id);
			})
			.catch(error => {
				console.error('Error unarchiving todo:', error);
			});
	}

	deleteTodo(id: string): void {
		if (!this.project) return;
		this.data.deleteTodo(this.project.id, id)
			.then(() => {
				this.loadTodos(this.project!.id);
			})
			.catch(error => {
				console.error('Error deleting todo:', error);
			});
	}

	cycleStatus(todo: Todo): void {
		if (!this.project) return;
		const order: ('new' | 'in-progress' | 'done')[] = ['new', 'in-progress', 'done'];
		const currentIndex = order.indexOf(todo.status);
		const nextStatus = order[(currentIndex + 1) % order.length];
		this.data.updateTodo(this.project.id, todo.id, { status: nextStatus })
			.then(() => {
				this.loadTodos(this.project!.id);
			})
			.catch(error => {
				console.error('Error updating todo status:', error);
			});
	}

	openTodoActions(todo: Todo): void {
		this.selectedTodo = todo;
	}

	// Focus management
	focusNewTodoInput(): void {
		setTimeout(() => {
			this.newTodoInput?.setFocus();
		}, 100);
	}

	// Getters for todo counts
	get doneTodosCount(): number {
		return this.todos.filter(t => t.status === 'done').length;
	}

	get newTodosCount(): number {
		return this.todos.filter(t => t.status === 'new').length;
	}

	get inProgressTodosCount(): number {
		return this.todos.filter(t => t.status === 'in-progress').length;
	}

	get filteredTodos(): Todo[] {
		if (!this.priorityFilter) {
			return this.todos;
		}
		return this.todos.filter(todo => todo.priority === this.priorityFilter);
	}
}
