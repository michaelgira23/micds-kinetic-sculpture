import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

declare const xeogl: any;

@Component({
	selector: 'app-visualizer',
	templateUrl: './visualizer.component.html',
	styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit {

	@ViewChild('container') container: ElementRef;
	@ViewChild('view') viewCanvas: ElementRef;

	scene: any;

	constructor() { }

	ngOnInit() {
		// setTimeout(() => {
		// 	this.draw();
		// }, 500);
		setInterval(() => {
			this.resizeCanvas();
		}, 1000);
	}

	resizeCanvas() {
		console.log(this.container.nativeElement);
		this.viewCanvas.nativeElement.width  = this.container.nativeElement.innerWidth;
		this.viewCanvas.nativeElement.height = this.container.nativeElement.innerHeight;
	}

	draw() {

		console.log('create scene');
		this.scene = new xeogl.Scene({
			// canvas: this.viewCanvas.nativeElement,
			// canvas: 'view',
			// transparent: true
		});

		// Allow user camera control
		new xeogl.InputControl();

		const box = new xeogl.BoxGeometry({
			xSize: 1,
			ySize: 1,
			zSize: 1
		});

		const material = new xeogl.MetallicMaterial({
			baseColor: [0.56, 0.57, 0.58],
			metallic: 1,
			roughness: 0.5
		});

		const entity = new xeogl.Entity({
			geometry: box,
			material
		});

		console.log(xeogl);
		// console.log(xeogl, xeogl.InputControl);

		// entity.scene.on('tick', () => {
		// 	entity.camera.view.rotateEyeY(1.0);
		// });
	}

}
