import { Component, OnInit } from '@angular/core';

declare const xeogl: any;

@Component({
	selector: 'app-visualizer',
	templateUrl: './visualizer.component.html',
	styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit {

	scene: any;

	constructor() { }

	ngOnInit() {
		console.log('create scene');
		this.scene = new xeogl.Scene({
			canvasId: 'visualizer'
		});
	}

}
