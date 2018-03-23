import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as ResizeSensor from 'css-element-queries/src/ResizeSensor';
import * as THREE from 'three';
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';

import { VISUALIZER_TYPE } from './visualizer-sidebar/visualizer-sidebar.component';

import { formations } from '../../../../src/custom/formations';
import { Grid } from '../../../../src/lib/grid';
import { sequences } from '../../../../src/custom/sequences';
import { HeightMap } from '../../../../src/lib/tick';
import { lastTime } from '../../../../src/lib/utils';

@Component({
	selector: 'app-visualizer',
	templateUrl: './visualizer.component.html',
	styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit {

	@ViewChild('container') container: ElementRef;
	@ViewChild('visualizer') canvas: ElementRef;

	updateURLTimeout: any;
	animateInterval: any;

	// Height of sculpture (max height modules can reach)
	maxHeight = 10;

	// How many modules in x and y direction
	nx = 8;
	ny = 8;

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
	font: THREE.Font;

	// Three.js object of each module in grid
	modules: { tip: THREE.Mesh, string: THREE.Line, label: THREE.Mesh }[][] = [];
	labels: { x: THREE.Mesh[], y: THREE.Mesh[] } = { x: [], y: [] };

	// Current variables while playing formation
	get selectedType() {
		return this._selectedType;
	}
	set selectedType(type: VISUALIZER_TYPE) {
		this._selectedType = type;
		this.updateUrl();
	}
	private _selectedType: VISUALIZER_TYPE;

	get selectedName() {
		return this._selectedName;
	}
	set selectedName(name: string) {
		this._selectedName = name;
		this.updateUrl();
	}
	private _selectedName: string;

	get loop() {
		return this._loop;
	}
	set loop(value: boolean) {
		this._loop = value;
		this.updateUrl();
	}
	private _loop: boolean;


	current = 0;
	PLAYER_STATE = PLAYER_STATE;
	state = PLAYER_STATE.NOT_STARTED;
	showModuleLabels = false;

	constructor(private router: Router, private route: ActivatedRoute) { }

	ngOnInit() {
		this.setupScene();
		this.setupLighting();
		this.setupLabels();
		this.setupModules();
		this.setupCamera();

		setTimeout(() => {
			// See if there's URL parameters
			const params = this.route.snapshot.queryParams;
			// Update loop value if it's valid
			this.loop = (params.loop === 'true');
		});

		// Animate Three.js
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
	 * Add text labels for x and y modules
	 */

	setupLabels() {
		// Load font
		const loader = new THREE.FontLoader();
		loader.load('/assets/Open Sans Light_Regular.json', font => {
			this.font = font;

			const axisMaterial = new THREE.MeshStandardMaterial({
				color: '#eee',
				transparent: true,
				opacity: 0.5,
				roughness: 1
			});
			const axisFontOptions = {
				font,
				size: 1,
				height: 0.1
			};

			// X Labels
			for (let x = 0; x < this.nx; x++) {
				const geometry = new THREE.TextGeometry(`x${x}`, axisFontOptions);
				// Calculate offset for centering labels
				geometry.computeBoundingBox();
				const centerOffset = 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

				const text = new THREE.Mesh(geometry, axisMaterial);
				text.position.x = (x * this.spaceBetween) + centerOffset;
				text.position.y = this.maxHeight;
				text.position.z = -this.spaceBetween;
				text.rotateY(Math.PI);

				this.labels.x[x] = text;
				this.scene.add(this.labels.x[x]);
			}

			// Y Labels
			for (let y = 0; y < this.ny; y++) {
				const geometry = new THREE.TextGeometry(`y${y}`, axisFontOptions);
				// Calculate offset for centering labels
				geometry.computeBoundingBox();
				// Still use x axis because we haven't rotated text yet
				const centerOffset = 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

				const text = new THREE.Mesh(geometry, axisMaterial);
				text.position.x = -this.spaceBetween;
				text.position.y = this.maxHeight;
				text.position.z = (y * this.spaceBetween) - centerOffset;
				text.rotateY(-Math.PI / 2);

				this.labels.y[y] = text;
				this.scene.add(this.labels.y[y]);
			}

			this.updateModuleLabels();
		});
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
			transparent: true,
			opacity: 0.5,
			dashSize: 0.1,
			gapSize: 0.1
		});

		for (let x = 0; x < this.nx; x++) {
			this.modules[x] = [];
			for (let y = 0; y < this.ny; y++) {
				this.modules[x][y] = {
					tip: null,
					string: null,
					label: null
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
		this.state = PLAYER_STATE.LOADING;

		// Just so that we can register the player is loading
		setTimeout(async () => {
			await new Promise((resolve, reject) => {
				const grid = new Grid(this.nx, this.ny, this.maxHeight, 10);

				switch (this.selectedType) {
					case VISUALIZER_TYPE.FORMATION:
						grid.coordinator.addFormation(formations[this.selectedName], 10000);
						break;
					case VISUALIZER_TYPE.SEQUENCE:
						grid.coordinator.import(sequences[this.selectedName]);
						break;
				}

				const heightMapDuration = grid.coordinator.export(this.loop);
				const heightMapDurationTimes = Object.keys(heightMapDuration);
				const heightMapDurationDuration = lastTime(heightMapDuration);
				const startTime = Number(heightMapDurationTimes[0]);
				console.log('height map duration', heightMapDurationDuration, heightMapDuration);

				this.state = PLAYER_STATE.PLAYING;
				this.current = startTime;

				this.animateInterval = setInterval(() => {
					let heightMap = heightMapDuration[this.current];
					// Check if current height map duration has finished playing
					if (!heightMap) {
						// If looping, just start back at beginning
						if (this.loop) {
							this.current = startTime;
							heightMap = heightMapDuration[this.current];
						} else {
							// If not looping, just stop
							clearInterval(this.animateInterval);
							this.state = PLAYER_STATE.FINISHED;
							resolve();
							return;
						}
					}
					this.updateHeightMap(heightMap);
					this.current += grid.updateFrequency;
				}, grid.updateFrequency);
			});
		}, 7);
	}

	/**
	 * Stop animation
	 */

	stopAnimate() {
		if (this.animateInterval) {
			clearInterval(this.animateInterval);
		}
		this.animateInterval = null;
		this.state = PLAYER_STATE.FINISHED;
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
		this.updateModuleLabels(heightMap);
	}

	/**
	 * Update height labels for modules
	 */

	updateModuleLabels(heightMap?: HeightMap) {
		if (!this.showModuleLabels || !this.font) {
			return;
		}

		// Height labels
		const heightMaterial = new THREE.MeshStandardMaterial({
			color: '#4286f4',
			transparent: true,
			opacity: 1,
			roughness: 1
		});
		const heightFontOptions = {
			font: this.font,
			size: 0.75,
			height: 0.1
		};
		for (let x = 0; x < this.nx; x++) {
			for (let y = 0; y < this.ny; y++) {
				if (this.modules[x] && this.modules[x][y] && this.modules[x][y].label) {
					this.scene.remove(this.modules[x][y].label);
				}

				const height = heightMap ? heightMap[x][y] : 0;
				const geometry = new THREE.TextGeometry(`${height.toFixed(1)}m`, heightFontOptions);
				const text = new THREE.Mesh(geometry, heightMaterial);
				text.position.x = (x * this.spaceBetween);
				text.position.y = this.maxHeight;
				text.position.z = (y * this.spaceBetween);

				text.rotateY(Math.PI);
				text.rotateX(-Math.PI / 2);

				this.modules[x][y].label = text;
				this.scene.add(this.modules[x][y].label);
			}
		}
	}

	private updateUrl() {
		// Add timeout so inspector doesn't lag out when spamming
		clearTimeout(this.updateURLTimeout);
		this.updateURLTimeout = setTimeout(() => {
			this.router.navigate(['/visualizer'], {
				queryParams: {
					type: this.selectedType,
					name: this.selectedName,
					loop: this.loop
				}
			});
		}, 500);
}

}

enum PLAYER_STATE {
	NOT_STARTED = 'Not started',
	LOADING = 'Loading...',
	PLAYING = 'Playing',
	FINISHED = 'Finished'
}
