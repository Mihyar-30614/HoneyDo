export interface Todo {
	status: 'new' | 'in-progress' | 'done';
	id: string;
	title: string;
	completed: boolean;
	projectId: string;
	createdAt?: any;
	archived?: boolean;
	description?: string;
	priority?: 'low' | 'medium' | 'high';
}
