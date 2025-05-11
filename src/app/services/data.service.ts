// src/app/services/data.service.ts
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

	getProjects(userId: string): Observable<Project[]> {
		const ref = collection(this.fs, 'projects');
		const q = query(ref, where('userId', '==', userId), orderBy('createdAt'));
		return collectionData(q, { idField: 'id' }) as Observable<Project[]>;
	}

	addProject(name: string, userId: string) {
		return addDoc(collection(this.fs, 'projects'), {
			name,
			userId,
			createdAt: serverTimestamp(),
		});
	}

	updateProject(id: string, name: string) {
		return updateDoc(doc(this.fs, `projects/${id}`), { name });
	}

	deleteProject(id: string) {
		// you can batch-delete todos then the project
		return deleteDoc(doc(this.fs, `projects/${id}`));
	}

	getTodos(projectId: string): Observable<Todo[]> {
		const ref = collection(this.fs, 'todos');
		const q = query(ref, where('projectId', '==', projectId), orderBy('createdAt'));
		return collectionData(q, { idField: 'id' }) as Observable<Todo[]>;
	}

	addTodo(title: string, projectId: string) {
		return addDoc(collection(this.fs, 'todos'), {
			title,
			completed: false,
			projectId,
			createdAt: serverTimestamp(),
		});
	}

	updateTodo(id: string, data: Partial<Todo>) {
		return updateDoc(doc(this.fs, `todos/${id}`), data);
	}

	deleteTodo(id: string) {
		return deleteDoc(doc(this.fs, `todos/${id}`));
	}
}
