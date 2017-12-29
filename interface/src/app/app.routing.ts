import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisualizerComponent } from './visualizer/visualizer.component';

/**
 * Router Config
 */

export const routes: Routes = [
	// {
	// 	path: '',
	// 	component: AppComponent
	// },
	{
		path: 'visualizer',
		component: VisualizerComponent
	},
	{
		path: '**',
		redirectTo: '/visualizer'
	}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
