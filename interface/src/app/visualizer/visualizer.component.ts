import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as ResizeSensor from 'css-element-queries/src/ResizeSensor';
import * as THREE from 'three';
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';

import { defaultFormations } from '../../../../src/lib/default-formations';
import { Grid } from '../../../../src/lib/grid';
import { HeightMap } from '../../../../src/lib/tick';

@Component({
	selector: 'app-visualizer',
	templateUrl: './visualizer.component.html',
	styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit {

	@ViewChild('container') container: ElementRef;
	@ViewChild('visualizer') canvas: ElementRef;

	// Height of sculpture (max height modules can reach)
	maxHeight = 10;

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

	// Current variables while playing formation
	formation: string;
	current = 0;
	PLAYER_STATE = PLAYER_STATE;
	state = PLAYER_STATE.NOT_STARTED;

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
		// THREE.AxisHelper has not been updated to THREE.AxesHelper in @types/three
		this.scene.add(new (THREE as any).AxesHelper(this.spaceBetween / 2));
	}

	/**
	 * Set the camera position and initialize drag/touch controls to move camera
	 */

	setupCamera() {
		// Setup camera
		// this.camera.position.set(this.xLength / 2, 0, this.yLength / 2);
		this.camera.position.x = -this.xLength / 2;
		this.camera.position.y = this.maxHeight;
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
		const sphereMaterial = new THREE.MeshStandardMaterial({ color: '#eee', roughness: 1 });

		const lineMaterial = new THREE.LineDashedMaterial({
			color: 0xffff00,
			dashSize: 0.1,
			gapSize: 0.1
		});

		for (let x = 0; x < this.nx; x++) {
			this.modules[x] = [];
			for (let y = 0; y < this.ny; y++) {
				this.modules[x][y] = {
					tip: null,
					string: null
				};

				// Just the tip
				this.modules[x][y].tip = new THREE.Mesh(sphereGeometry, sphereMaterial);
				this.modules[x][y].tip.position.x = x * this.spaceBetween;
				this.modules[x][y].tip.position.z = y * this.spaceBetween;

				// Line
				this.modules[x][y].string = new THREE.Line(this.getStringVertices(x, y), lineMaterial);

				this.scene.add(this.modules[x][y].tip);
				this.scene.add(this.modules[x][y].string);
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
			tipPos.x, tipPos.y,       tipPos.z,
			tipPos.x, this.maxHeight, tipPos.z
		]);
		geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
		return geometry;
	}

	/**
	 * Animate modules with coordination algorithm
	 */

	animate() {
		this.state = PLAYER_STATE.PLAYING;

		const grid = new Grid(this.nx, this.ny, this.maxHeight, 10);
		grid.coordinator.addFormation(defaultFormations[this.formation]);
		const heightMapDuration = grid.coordinator.export();
		const times = Object.keys(heightMapDuration).map(time => Number(time));

		console.log('height map duration', heightMapDuration);

		this.current = 0;

		const interval = setInterval(() => {
			const heightMap = heightMapDuration[this.current];
			if (!heightMap) {
				clearInterval(interval);
				this.state = PLAYER_STATE.FINISHED;
				return;
			}
			this.updateHeightMap(heightMap);
			this.current += grid.updateFrequency;
		}, grid.updateFrequency);
	}

	/**
	 * Update ball positions with height map
	 */

	updateHeightMap(heightMap: HeightMap) {
		let logged = false;
		for (let x = 0; x < this.nx; x++) {
			for (let y = 0; y < this.ny; y++) {
				if (typeof heightMap[x] === 'object' && typeof heightMap[x][y] === 'number') {
					this.modules[x][y].tip.position.y = heightMap[x][y];
					/** @todo Try updating string position as well */
					// const position = ((this.modules[x][y].string.geometry as THREE.BufferGeometry).attributes as any).position.array;
					// position[1] = heightMap[x][y];
					// position.needsUpdate = true;
				} else {
					if (!logged) {
						console.log(`=====[Missing point(s) for time ${this.current}]=====`);
						logged = true;
					}
					console.log(`x: ${x} y: ${y}`, heightMap);
				}
			}
		}
	}

}

enum PLAYER_STATE {
	NOT_STARTED = 'Not started',
	PLAYING = 'Playing',
	FINISHED = 'Finished'
}
