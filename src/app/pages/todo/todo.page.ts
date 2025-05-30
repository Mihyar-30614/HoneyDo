import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Todo } from '../../models/todo.model';
import { Project } from '../../models/project.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderByPipe } from '../../pipes/order-by.pipe';
import { IonBadge, IonTitle, IonProgressBar, IonCol, IonRow, IonGrid, IonLabel, IonIcon, IonItem, IonList, IonButtons, IonHeader, IonToolbar, IonContent, IonButton, IonSearchbar, IonInput, IonTextarea, IonModal, IonFab, IonFabButton } from '@ionic/angular/standalone';

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
    IonFabButton,
  ],
})
export class TodoPage implements OnInit {
  user: User | null = null;
  project: Project | null = null;
  todos: Todo[] = [];
  archivedTodos: Todo[] = [];
  loading = true;

  // Form state
  newTodoTitle = '';
  editingTodo: Todo | null = null;
  editTodoTitle = '';
  showAddTodoModal = false;

  constructor(
    private auth: AuthService,
    private data: DataService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => {
      if (!u) {
        this.router.navigate(['/login']);
      } else {
        this.user = u;
        this.route.paramMap.subscribe(params => {
          const projectId = params.get('projectId');
          if (projectId) {
            this.loadProject(projectId);
            this.loadTodos(projectId);
          }
        });
      }
    });
  }

  loadProject(projectId: string): void {
    // Optionally, fetch project details from a service if needed
    // For now, just set a placeholder with the id
    this.project = { id: projectId, name: '', ownerId: '', archived: false };
    // If you want to show project name, you can fetch it from DataService
    this.data.getProjects(this.user!.uid).subscribe(projects => {
      const found = projects.find(p => p.id === projectId);
      if (found) this.project = found;
    });
  }

  loadTodos(projectId: string): void {
    this.data.getTodos(projectId).subscribe(list => {
      this.todos = list.filter(t => !t.archived);
      this.archivedTodos = list.filter(t => t.archived);
    });
  }

  addTodo(): void {
    if (!this.newTodoTitle.trim() || !this.project) return;
    this.data.addTodo(this.newTodoTitle, this.project.id, 'new')
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
