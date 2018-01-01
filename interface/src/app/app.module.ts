import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { routing } from './app.routing';
import { GridsterModule } from 'angular2gridster';

import { AppComponent } from './app.component';
import { VisualizerComponent } from './visualizer/visualizer.component';
import { VisualizerSidebarComponent } from './visualizer/visualizer-sidebar/visualizer-sidebar.component';
import { SequencerComponent } from './sequencer/sequencer.component';

@NgModule({
	declarations: [
		AppComponent,
		VisualizerComponent,
		VisualizerSidebarComponent,
		SequencerComponent
	],
	imports: [
		BrowserModule,
		routing,
		GridsterModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
