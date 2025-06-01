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
  IonInput,
  IonModal,
  IonFab,
  IonFabButton,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonPopover,
  IonTextarea,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.page.html',
  styleUrls: ['./todo.page.scss'],
  standalone: true,
  imports: [
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
  editingTodo: Todo | null = null;
  editTodoTitle = '';
  editTodoDescription = '';
  showAddTodoModal = false;
  selectedTodo: Todo | null = null;

  // Subscriptions
  private authSubscription: Subscription | null = null;
  private routeSubscription: Subscription | null = null;

  @ViewChild('newTodoInput') newTodoInput?: IonInput;

  constructor(
    private auth: AuthService,
    private data: DataService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

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
    this.data.getTodos(projectId).subscribe(list => {
      this.todos = list.filter(t => !t.archived);
      this.archivedTodos = list.filter(t => t.archived);
      this.loading = false;
    });
  }

  // Todo actions
  addTodo(): void {
    if (!this.newTodoTitle.trim() || !this.project) return;
    this.data.addTodo(this.newTodoTitle, this.project.id, 'new', this.newTodoDescription)
      .then(() => {
        this.newTodoTitle = '';
        this.newTodoDescription = '';
      });
  }

  editT(todo: Todo): void {
    this.editingTodo = todo;
    this.editTodoTitle = todo.title;
    this.editTodoDescription = todo.description || '';
  }

  updateTodo(): void {
    if (!this.editingTodo || !this.editTodoTitle.trim()) return;
    this.data.updateTodo(this.editingTodo.id, {
      title: this.editTodoTitle,
      description: this.editTodoDescription
    })
      .then(() => {
        this.editingTodo = null;
        this.editTodoTitle = '';
        this.editTodoDescription = '';
      });
  }

  cancelTodoEdit(): void {
    this.editingTodo = null;
    this.editTodoTitle = '';
    this.editTodoDescription = '';
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

  cycleStatus(todo: Todo): void {
    const order: ('new' | 'in-progress' | 'done')[] = ['new', 'in-progress', 'done'];
    const currentIndex = order.indexOf(todo.status);
    const nextStatus = order[(currentIndex + 1) % order.length];
    this.data.updateTodo(todo.id, { status: nextStatus });
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
}
