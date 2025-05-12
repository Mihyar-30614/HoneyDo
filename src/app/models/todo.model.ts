export interface Todo {
	id: string;
	title: string;
	completed: boolean;
	projectId: string;
	createdAt?: any;
	archived?: boolean;
}
