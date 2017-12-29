import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { routing } from './app.routing';

import { AppComponent } from './app.component';
import { VisualizerComponent } from './visualizer/visualizer.component';
import { FormationsSidebarComponent } from './visualizer/formations-sidebar/formations-sidebar.component';

@NgModule({
	declarations: [
		AppComponent,
		VisualizerComponent,
		FormationsSidebarComponent
	],
	imports: [
		BrowserModule,
		routing
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
