import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

/**
 * Router Config
 */

export const routes: Routes = [
	{
		path: '',
		component: AppComponent
	},
	{
		path: '**',
		redirectTo: ''
	}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
