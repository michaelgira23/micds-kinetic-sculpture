import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as ResizeSensor from 'css-element-queries/src/ResizeSensor';

// import * as xeogl from '../common/xeogl.min';
declare const xeogl: any;

@Component({
	selector: 'app-visualizer',
	templateUrl: './visualizer.component.html',
	styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit {

	@ViewChild('container') container: ElementRef;
	@ViewChild('visualizer') canvas: ElementRef;

	scene: any;

	gridWidth = 5;
	gridHeight = 5;

	constructor() { }

	ngOnInit() {
		// Resize canvas to fit container
		const resizeCanvas = () => {
			const width = this.container.nativeElement.clientWidth;
			const height = this.container.nativeElement.clientHeight;

			this.canvas.nativeElement.width = width;
			this.canvas.nativeElement.height = height;
		};
		resizeCanvas();
		new ResizeSensor(this.container.nativeElement, resizeCanvas);

		xeogl.scene = new xeogl.Scene({
			canvas: this.canvas.nativeElement,
			// backgroundColor: [0.3, 0.6, 0.9]
			// transparent: true
		});
		new xeogl.Entity({
			geometry: new xeogl.TorusGeometry({
				radius: 1.0,
				tube: 0.3,
				radialSegments: 120,
				tubeSegments: 60
			}),
			material: new xeogl.MetallicMaterial({
				baseColorMap: new xeogl.Texture({
					src: '/assets/textures/uvGrid2.jpg'
				})
			})
		});
		xeogl.scene.camera.view.eye = [0, 0, -4];
		xeogl.scene.on('tick', function () {
			this.camera.view.rotateEyeY(0.5);
			// this.camera.view.rotateEyeX(0.3);
		});

		// Allow user camera control
		new xeogl.InputControl();
	}

}
