import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

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
		loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
		canActivate: [authGuard]
	},
	{
		path: 'todo/:projectId',
		loadComponent: () => import('./pages/todo/todo.page').then(m => m.TodoPage),
		canActivate: [authGuard]
	},
	{
		path: 'profile',
		loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
		canActivate: [authGuard],
	},
	{
		path: 'forgot-password',
		loadComponent: () => import('./pages/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage)
	},
];
