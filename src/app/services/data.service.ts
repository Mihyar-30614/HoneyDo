import { Injectable, inject } from '@angular/core';
import {
	Firestore,
	collection,
	collectionData,
	query,
	where,
	orderBy,
	addDoc,
	doc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	getDocs,
	getDoc,
	arrayUnion,
	arrayRemove,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { Todo } from '../models/todo.model';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class DataService {
	private fs = inject(Firestore);
	private auth = inject(Auth);

	/**
	 * Fetches all projects for a user, active and archived.
	 */
	getProjects(userId: string): Observable<Project[]> {
		const ref = collection(this.fs, 'projects');
		const q = query(
			ref,
			where('ownerId', '==', userId),
			orderBy('createdAt', 'desc')
		);
		return collectionData(q, { idField: 'id' }) as Observable<Project[]>;
	}

	/**
	 * Adds a new project defaulting to not archived.
	 */
	addProject(name: string, userId: string, description?: string) {
		return addDoc(collection(this.fs, 'projects'), {
			name,
			ownerId: userId,
			description: description || '',
			archived: false,
			todos: [],
			createdAt: serverTimestamp(),
		});
	}

	/**
	 * Updates a project document by its ID. Accepts partial fields, including name or archived flag.
	 */
	updateProject(id: string, data: Partial<Project>, userId: string) {
		const { ownerId, todos, ...updateData } = data;
		return updateDoc(doc(this.fs, `projects/${id}`), updateData);
	}

	/**
	 * Gets a single project by ID
	 */
	async getProject(projectId: string): Promise<Project | null> {
		const projectRef = doc(this.fs, `projects/${projectId}`);
		const projectSnap = await getDoc(projectRef);
		if (!projectSnap.exists()) {
			return null;
		}
		return { id: projectSnap.id, ...projectSnap.data() } as Project;
	}

	/**
	 * Permanently deletes a project and its associated todos.
	 */
	async deleteProject(id: string) {
		const userId = this.auth.currentUser?.uid;
		if (!userId) {
			return Promise.reject('User not authenticated');
		}

		// Get the project to verify ownership
		const project = await this.getProject(id);
		if (!project) {
			return Promise.reject('Project not found');
		}

		if (project.ownerId !== userId) {
			return Promise.reject('Not authorized to delete this project');
		}

		try {
			// Delete the project (todos are embedded, so they'll be deleted with the project)
			const projectRef = doc(this.fs, `projects/${id}`);
			await deleteDoc(projectRef);
		} catch (error) {
			console.error('Error in deleteProject:', error);
			return Promise.reject(error);
		}
	}

	/**
	 * Fetches all todos for a project, active and archived.
	 */
	async getTodos(projectId: string): Promise<Todo[]> {
		const userId = this.auth.currentUser?.uid;
		if (!userId) {
			return Promise.reject('User not authenticated');
		}

		const project = await this.getProject(projectId);
		if (!project) {
			return [];
		}
		return project.todos || [];
	}

	/**
	 * Adds a new todo to a project.
	 */
	async addTodo(title: string, projectId: string, status: 'new' | 'in-progress' | 'done' = 'new', description?: string, priority?: 'low' | 'medium' | 'high') {
		const userId = this.auth.currentUser?.uid;
		if (!userId) {
			return Promise.reject('User not authenticated');
		}

		// Get the project to verify ownership
		const project = await this.getProject(projectId);
		if (!project) {
			return Promise.reject('Project not found');
		}

		if (project.ownerId !== userId) {
			return Promise.reject('Not authorized to add todos to this project');
		}

		// Create todo object with only defined values
		const newTodo: any = {
			id: this.generateTodoId(),
			title,
			status,
			completed: status === 'done',
			archived: false,
			description: description || '',
			createdAt: new Date(),
		};

		// Only add completedAt if status is 'done'
		if (status === 'done') {
			newTodo.completedAt = new Date();
		}

		// Only add priority if it's provided
		if (priority) {
			newTodo.priority = priority;
		}

		const projectRef = doc(this.fs, `projects/${projectId}`);
		return updateDoc(projectRef, {
			todos: arrayUnion(newTodo)
		});
	}

	/**
	 * Updates a todo within a project.
	 */
	async updateTodo(projectId: string, todoId: string, data: Partial<Todo>) {
		const userId = this.auth.currentUser?.uid;
		if (!userId) {
			return Promise.reject('User not authenticated');
		}

		// Get the project to verify ownership
		const project = await this.getProject(projectId);
		if (!project) {
			return Promise.reject('Project not found');
		}

		if (project.ownerId !== userId) {
			return Promise.reject('Not authorized to update todos in this project');
		}

		// Find and update the specific todo
		const todos = project.todos || [];
		const todoIndex = todos.findIndex(todo => todo.id === todoId);

		if (todoIndex === -1) {
			return Promise.reject('Todo not found');
		}

		// Auto-sync completed field with status
		let updatedData: any = { ...data };
		if (data.status !== undefined) {
			updatedData.completed = data.status === 'done';
			// Set completedAt when status becomes 'done', clear it when status changes from 'done'
			if (data.status === 'done') {
				updatedData.completedAt = new Date();
			} else {
				// Remove completedAt field instead of setting to null
				delete updatedData.completedAt;
			}
		}

		// Filter out any undefined values before updating
		const cleanUpdatedData: any = {};
		Object.keys(updatedData).forEach(key => {
			if (updatedData[key] !== undefined) {
				cleanUpdatedData[key] = updatedData[key];
			}
		});

		// Update the todo
		todos[todoIndex] = { ...todos[todoIndex], ...cleanUpdatedData };

		const projectRef = doc(this.fs, `projects/${projectId}`);
		return updateDoc(projectRef, {
			todos: todos
		});
	}

	/**
	 * Permanently deletes a todo from a project.
	 */
	async deleteTodo(projectId: string, todoId: string) {
		const userId = this.auth.currentUser?.uid;
		if (!userId) {
			return Promise.reject('User not authenticated');
		}

		// Get the project to verify ownership
		const project = await this.getProject(projectId);
		if (!project) {
			return Promise.reject('Project not found');
		}

		if (project.ownerId !== userId) {
			return Promise.reject('Not authorized to delete todos from this project');
		}

		// Find the todo to remove
		const todos = project.todos || [];
		const todoToRemove = todos.find(todo => todo.id === todoId);

		if (!todoToRemove) {
			return Promise.reject('Todo not found');
		}

		const projectRef = doc(this.fs, `projects/${projectId}`);
		return updateDoc(projectRef, {
			todos: arrayRemove(todoToRemove)
		});
	}

	/**
	 * Generates a unique ID for todos
	 */
	private generateTodoId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}
}

