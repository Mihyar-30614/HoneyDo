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
			createdAt: serverTimestamp(),
		});
	}

	/**
	 * Updates a project document by its ID. Accepts partial fields, including name or archived flag.
	 */
	updateProject(id: string, data: Partial<Project>, userId: string) {
		const { ownerId, ...updateData } = data;
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
			// Delete all todos in the project
			const todosQuery = query(
				collection(this.fs, 'todos'),
				where('projectId', '==', id),
				where('ownerId', '==', userId) // Add owner check for todos
			);
			const todosSnapshot = await getDocs(todosQuery);

			// Delete todos in parallel
			const todoDeletions = todosSnapshot.docs.map(doc =>
				deleteDoc(doc.ref)
			);
			await Promise.all(todoDeletions);

			// Delete the project
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
	getTodos(projectId: string): Observable<Todo[]> {
		const userId = this.auth.currentUser?.uid;
		if (!userId) {
			return new Observable(subscriber => {
				subscriber.error('User not authenticated');
				subscriber.complete();
			});
		}
		const ref = collection(this.fs, 'todos');
		const q = query(
			ref,
			where('projectId', '==', projectId),
			where('ownerId', '==', userId),
			orderBy('createdAt', 'desc')
		);
		return collectionData(q, { idField: 'id' }) as Observable<Todo[]>;
	}

	/**
	 * Adds a new todo defaulting to not archived.
	 */
	addTodo(title: string, projectId: string, status: 'new' | 'in-progress' | 'done' = 'new', description?: string) {
		const userId = this.auth.currentUser?.uid;
		if (!userId) {
			return Promise.reject('User not authenticated');
		}
		return addDoc(collection(this.fs, 'todos'), {
			title,
			status,
			archived: false,
			projectId,
			ownerId: userId,
			description: description || '',
			createdAt: serverTimestamp(),
		});
	}

	/**
	 * Updates a todo document by its ID. Accepts partial fields, including completed, title, or archived flag.
	 */
	updateTodo(id: string, data: Partial<Todo>) {
		return updateDoc(doc(this.fs, `todos/${id}`), data);
	}

	/**
	 * Permanently deletes a todo.
	 */
	deleteTodo(id: string) {
		return deleteDoc(doc(this.fs, `todos/${id}`));
	}
}
