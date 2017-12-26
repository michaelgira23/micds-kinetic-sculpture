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

	// Height of sculpture (max height modules can reach)
	height = 10;

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
	modules: { tip: THREE.Mesh, string: THREE.Line }[][] = [];

	constructor() { }

	ngOnInit() {
		this.setupScene();
		this.setupLighting();
		this.setupModules();
		this.setupCamera();

		const animate = () => {
			requestAnimationFrame(animate);
			this.controls.update();
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}

	/**
	 * Create scene object, resize canvas on window resize, set scene background
	 */

	setupScene() {
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
		this.scene.add(new THREE.AxesHelper(this.spaceBetween / 2));
	}

	/**
	 * Set the camera position and initialize drag/touch controls to move camera
	 */

	setupCamera() {
		// Setup camera
		// this.camera.position.set(this.xLength / 2, 0, this.yLength / 2);
		this.camera.position.x = -this.xLength / 2;
		this.camera.position.y = this.height;
		this.camera.position.z = -this.yLength / 2;

		// this.camera.lookAt(this.xLength / 2, 0, this.yLength / 2);
		// this.camera.zoom = 0;

		// Setup controls
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.rotateSpeed = 0.25;
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.1;
	}

	/**
	 * Lights! Camera! Action! (Actually only the lights part)
	 */

	setupLighting() {
		// Hemisphere light
		const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
		hemiLight.color.setHSL(0.6, 1, 0.6);
		hemiLight.groundColor.setHSL(0.095, 1, 0.75);
		hemiLight.position.set(0, 50, 0);
		this.scene.add(hemiLight);
		const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
		this.scene.add(hemiLightHelper);

		// Directional light
		const dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.color.setHSL(0.1, 1, 0.95);
		dirLight.position.set(-1, 1.75, 1);
		dirLight.position.multiplyScalar(30);
		this.scene.add(dirLight);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
	}

	/**
	 * Add the modules into a grid array
	 */

	setupModules() {
		// Add modules
		const sphereGeometry = new THREE.SphereGeometry(this.moduleLength / 2, 32, 32);
		const sphereMaterial = new THREE.MeshStandardMaterial({ color: '#eee', roughness: 1 }));

		const lineMaterial = new THREE.LineDashedMaterial({
			color: 0xffff00,
			dashSize: 0.1,
			gapSize: 0.1
		});

		for (let i = 0; i < this.nx; i++) {
			this.modules[i] = [];
			for (let j = 0; j < this.ny; j++) {
				this.modules[i][j] = {};

				// Just the tip
				this.modules[i][j].tip = new THREE.Mesh(sphereGeometry, sphereMaterial);
				this.modules[i][j].tip.position.x = i * this.spaceBetween;
				this.modules[i][j].tip.position.z = j * this.spaceBetween;

				// Line
				this.modules[i][j].string = new THREE.Line(this.getStringVertices(i, j), lineMaterial);

				this.scene.add(this.modules[i][j].tip);
				this.scene.add(this.modules[i][j].string);
			}
		}
	}

	/**
	 * Get the string vertices for a module at specific x and y positions
	 */

	getStringVertices(x: number, y: number) {
		const geometry = new THREE.BufferGeometry();
		const tipPos = this.modules[x][y].tip.position;
		const vertices = new Float32Array([
			tipPos.x, tipPos.y,    tipPos.z
			tipPos.x, this.height, tipPos.z
		]);
		geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
		return geometry;
	}

}
