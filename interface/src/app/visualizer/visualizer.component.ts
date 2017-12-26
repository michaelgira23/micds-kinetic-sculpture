import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as ResizeSensor from 'css-element-queries/src/ResizeSensor';
import * as THREE from 'three';
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';

@Component({
	selector: 'app-visualizer',
	templateUrl: './visualizer.component.html',
	styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit {

	@ViewChild('container') container: ElementRef;
	@ViewChild('visualizer') canvas: ElementRef;

	// How many modules in x and y direction
	nx = 5;
	ny = 5;

	// Dimensions to render module and space between them
	moduleLength = 1;
	spaceBetween = 5;

	// Length of grid in x and y directions
	xLength = (this.nx * this.moduleLength) + ((this.nx - 1) * this.spaceBetween);
	yLength = (this.ny * this.moduleLength) + ((this.ny - 1) * this.spaceBetween);

	// Three.js stuff
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	controls: any;

	// Three.js object of each module in grid
	modules: any[][] = [];

	constructor() { }

	ngOnInit() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.nativeElement });
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;

		// Resize canvas to fit container
		const resizeCanvas = () => {
			const width = this.container.nativeElement.clientWidth;
			const height = this.container.nativeElement.clientHeight;

			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
		};
		resizeCanvas();
		new ResizeSensor(this.container.nativeElement, resizeCanvas);

		// General setup
		this.scene.background = new THREE.Color('#202020');

		// Lighting
		const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
		hemiLight.color.setHSL(0.6, 1, 0.6);
		hemiLight.groundColor.setHSL(0.095, 1, 0.75);
		hemiLight.position.set(0, 50, 0);
		this.scene.add(hemiLight);
		const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
		this.scene.add(hemiLightHelper);

		const dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.color.setHSL(0.1, 1, 0.95);
		dirLight.position.set(-1, 1.75, 1);
		dirLight.position.multiplyScalar(30);
		this.scene.add(dirLight);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;

		// Origin
		const xGeometry = new THREE.Geometry();
		xGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
		xGeometry.vertices.push(new THREE.Vector3(1, 0, 0));
		const xLine = new THREE.Line(xGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
		this.scene.add(xLine);

		const yGeometry = new THREE.Geometry();
		yGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
		yGeometry.vertices.push(new THREE.Vector3(0, 1, 0));
		const yLine = new THREE.Line(yGeometry, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
		this.scene.add(yLine);

		const zGeometry = new THREE.Geometry();
		zGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
		zGeometry.vertices.push(new THREE.Vector3(0, 0, 1));
		const zLine = new THREE.Line(zGeometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));
		this.scene.add(zLine);

		// Add modules
		const sphereGeometry = new THREE.SphereGeometry(this.moduleLength / 2, 32, 32);
		const moduleMaterial = new THREE.MeshStandardMaterial({ color: '#eee', roughness: 1 }));
		for (let i = 0; i < this.nx; i++) {
			this.modules[i] = [];
			for (let j = 0; j < this.ny; j++) {
				this.modules[i][j] = new THREE.Mesh(sphereGeometry, moduleMaterial);
				this.modules[i][j].position.x = i * this.spaceBetween;
				this.modules[i][j].position.z = j * this.spaceBetween;
				this.scene.add(this.modules[i][j]);
			}
		}

		this.camera.position.x = -5;
		this.camera.position.y = 5;
		this.camera.position.z = -5;
		this.camera.lookAt(new THREE.Vector3(this.xLength / 2, this.spaceBetween, this.yLength / 2));

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.rotateSpeed = 0.25;
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.1;

		const animate = () => {
			requestAnimationFrame(animate);
			this.controls.update();
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}

}
