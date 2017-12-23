import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
// import '../common/OrbitControls';

declare const xeogl: any;

@Component({
	selector: 'app-visualizer',
	templateUrl: './visualizer.component.html',
	styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit {

	@ViewChild('container') container: ElementRef;

	scene: THREE.Scene;
	camera: THREE.Camera;
	renderer: THREE.WebGLRenderer;
	// controls: THREE.OrbitControls;

	gridWidth = 5;
	gridHeight = 5;

	constructor() { }

	ngOnInit() {
		const width = this.container.nativeElement.clientWidth;
		const height = this.container.nativeElement.clientHeight;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(width, height);
		this.container.nativeElement.appendChild(this.renderer.domElement);

		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const cube = new THREE.Mesh(geometry, material);
		this.scene.add(cube);

		this.camera.position.z = 5;

		// this.controls = new THREE.OrbitControls(this.camera);
		// this.controls.target.set(0, 0, 0);

		const animate = () => {
			requestAnimationFrame(animate);

			cube.rotation.x += 0.1;
			cube.rotation.y += 0.1;

			this.renderer.render(this.scene, this.camera);
		};

		animate();
	}

	// resizeCanvas() {
	// 	console.log(this.container.nativeElement);
	// 	this.viewCanvas.nativeElement.width  = this.container.nativeElement.innerWidth;
	// 	this.viewCanvas.nativeElement.height = this.container.nativeElement.innerHeight;
	// }

	// draw() {
	// 	console.log('create scene');
	// 	this.scene = new xeogl.Scene({
	// 		// canvas: this.viewCanvas.nativeElement,
	// 		// canvas: 'view',
	// 		// transparent: true
	// 	});
	//
	// 	// Allow user camera control
	// 	new xeogl.InputControl();
	//
	// 	const box = new xeogl.BoxGeometry({
	// 		xSize: 1,
	// 		ySize: 1,
	// 		zSize: 1
	// 	});
	//
	// 	const material = new xeogl.MetallicMaterial({
	// 		baseColor: [0.56, 0.57, 0.58],
	// 		metallic: 1,
	// 		roughness: 0.5
	// 	});
	//
	// 	const entity = new xeogl.Entity({
	// 		geometry: box,
	// 		material
	// 	});
	//
	// 	console.log(xeogl);
	// 	// console.log(xeogl, xeogl.InputControl);
	//
	// 	// entity.scene.on('tick', () => {
	// 	// 	entity.camera.view.rotateEyeY(1.0);
	// 	// });
	// }

}
