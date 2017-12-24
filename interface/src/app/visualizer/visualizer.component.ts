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

	spaceBetween = 5;

	gridX = 5;
	gridY = 5;
	moduleLength = 1;

	modules: any[][] = [];

	xLength = (this.gridX * this.moduleLength) + ((this.gridX - 1) * this.spaceBetween);
	yLength = (this.gridY * this.moduleLength) + ((this.gridY - 1) * this.spaceBetween);

	xeogl = xeogl;

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

		// Create scene
		xeogl.scene = new xeogl.Scene({
			canvas: this.canvas.nativeElement,
			backgroundColor: 'red'
		});

		xeogl.scene.camera.view.look = [
			this.xLength / 2,
			this.spaceBetween,
			this.yLength / 2
		];

		xeogl.scene.camera.view.eye = [
			-this.xLength,
			(this.xLength + this.yLength) / 2,
			-this.yLength
		];

		// Generate x and y labels
		// console.log('xeogl', xeogl);
		// for (let i = 0; i < this.gridX; i++) {
		// 	new xeogl.Entity({
		// 		geometry: new xeogl.VectorTextGeometry({
		// 			text: i,
		// 			origin: [0, 0, 0],
		// 			size: 2 // Size of each square character cell
		// 		}),
		// 		material: new xeogl.PhongMaterial({
		// 			emissive: [0.5, 1.0, 1.0],
		// 			lineWidth: 2
		// 		}),
		// 		lights: new xeogl.Lights({
		// 			lights: [] // No lights - rely on emissive color
		// 		}),
		// 		transform: new xeogl.Translate({
		// 			// xyz: [i * this.spaceBetween, 0, -this.spaceBetween]
		// 			xyz: [0, 40, 0]
		// 		})
		// 	});
		// }

		// Generate modules
		const tipGeometry = new xeogl.BoxGeometry({
			xSize: this.moduleLength,
			ySize: this.moduleLength,
			zSize: this.moduleLength
		});

		for (let i = 0; i < this.gridX; i++) {
			this.modules[i] = [];

			for (let j = 0; j < this.gridY; j++) {
				this.modules[i][j] = new xeogl.Entity({
					geometry: tipGeometry,
					material: new xeogl.MetallicMaterial({
						baseColorMap: new xeogl.Texture({
							src: '/assets/textures/uvGrid2.jpg'
						})
					}),
					transform: new xeogl.Translate({
						xyz: [
							i * this.spaceBetween,
							0,
							j * this.spaceBetween
						]
					})
				});
			}
		}

		// new xeogl.Entity({
		// 	geometry: new xeogl.TorusGeometry({
		// 		radius: 1.0,
		// 		tube: 0.3,
		// 		radialSegments: 120,
		// 		tubeSegments: 60
		// 	}),
		// 	material: new xeogl.MetallicMaterial({
		// 		baseColorMap: new xeogl.Texture({
		// 			src: '/assets/textures/uvGrid2.jpg'
		// 		})
		// 	})
		// });
		// xeogl.scene.camera.view.eye = [0, 0, -4];
		// xeogl.scene.on('tick', function () {
		// 	this.camera.view.rotateEyeY(0.5);
		// 	// this.camera.view.rotateEyeX(0.3);
		// });

		// Allow user camera control
		new xeogl.InputControl();
	}

}
