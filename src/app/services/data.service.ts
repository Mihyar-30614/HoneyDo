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
	 * Permanently deletes a project. Does not cascade to todos.
	 * For archiving, use updateProject(id, { archived: true }).
	 */
	deleteProject(id: string) {
		return deleteDoc(doc(this.fs, `projects/${id}`));
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
	addTodo(title: string, projectId: string, status: 'new' | 'in-progress' | 'done' = 'new') {
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
