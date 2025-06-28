import { Todo } from './todo.model';

export interface Project {
	id: string;
	name: string;
	ownerId: string;
	description?: string;
	createdAt?: any;
	archived?: boolean;
	progress?: number;
	todos?: Todo[];
}
