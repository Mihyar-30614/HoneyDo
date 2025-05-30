import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'landing',
		pathMatch: 'full',
	},
	{
		path: 'landing',
		loadComponent: () => import('./pages/landing/landing.page').then(m => m.LandingPage)
	},
	{
		path: 'login',
		loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
	},
	{
		path: 'signup',
		loadComponent: () => import('./pages/signup/signup.page').then(m => m.SignupPage)
	},
	{
		path: 'home',
		loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
	},
	{
		path: 'todo/:projectId',
		loadComponent: () => import('./pages/todo/todo.page').then(m => m.TodoPage),
	},
];
