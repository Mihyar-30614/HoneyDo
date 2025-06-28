export interface Todo {
	status: 'new' | 'in-progress' | 'done';
	id: string;
	title: string;
	completed: boolean;
	completedAt?: any;
	createdAt?: any;
	archived?: boolean;
	description?: string;
	priority?: 'low' | 'medium' | 'high';
}
