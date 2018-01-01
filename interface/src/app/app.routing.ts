import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisualizerComponent } from './visualizer/visualizer.component';
import { SequencerComponent } from './sequencer/sequencer.component';

/**
 * Router Config
 */

export const routes: Routes = [
	{
		path: 'visualizer',
		component: VisualizerComponent
	},
	{
		path: 'sequencer',
		component: SequencerComponent
	},
	{
		path: '**',
		redirectTo: '/visualizer'
	}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
