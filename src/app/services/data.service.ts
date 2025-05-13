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

@Injectable({ providedIn: 'root' })
export class DataService {
	private fs = inject(Firestore);

	/**
	 * Fetches all projects for a user, active and archived.
	 */
	getProjects(userId: string): Observable<Project[]> {
		const ref = collection(this.fs, 'projects');
		const q = query(
			ref,
			where('userId', '==', userId),
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
			userId,
			description: description || '',
			archived: false,
			createdAt: serverTimestamp(),
		});
	}

	/**
	 * Updates a project document by its ID. Accepts partial fields, including name or archived flag.
	 */
	updateProject(id: string, data: Partial<Project>) {
		return updateDoc(doc(this.fs, `projects/${id}`), data);
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
		const ref = collection(this.fs, 'todos');
		const q = query(
			ref,
			where('projectId', '==', projectId),
			orderBy('createdAt', 'desc')
		);
		return collectionData(q, { idField: 'id' }) as Observable<Todo[]>;
	}

	/**
	 * Adds a new todo defaulting to not archived.
	 */
	addTodo(title: string, projectId: string, status: 'new' | 'in-progress' | 'done' = 'new') {
		return addDoc(collection(this.fs, 'todos'), {
			title,
			status,
			archived: false,
			projectId,
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
