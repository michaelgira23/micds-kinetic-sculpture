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

	spaceBetween = 5;

	gridX = 5;
	gridY = 5;
	moduleLength = 1;

	modules: any[][] = [];

	xLength = (this.gridX * this.moduleLength) + ((this.gridX - 1) * this.spaceBetween);
	yLength = (this.gridY * this.moduleLength) + ((this.gridY - 1) * this.spaceBetween);

	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	controls: any;

	constructor() { }

	ngOnInit() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.nativeElement });
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

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

		//

		// const shiny = new THREE.MeshPhongMaterial({
		// 	color: 0xeee,
		// 	specular: 0x050505,
		// 	shininess: 100
		// });

		// Box
		// const geometry = new THREE.BoxGeometry(1, 1, 1);
		// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		// const cube = new THREE.Mesh(geometry, shiny);
		// this.scene.add(cube);

		// material = new THREE.MeshBasicMaterial( {
		// 	envMap: cubeCamera2.renderTarget.texture
		// } );
		// const sphere = new THREE.Mesh( new THREE.IcosahedronBufferGeometry( 20, 3 ) );
		// this.scene.add( sphere );

		// Sphere
		const shiny = new THREE.MeshStandardMaterial({ color: '#000', roughness: 1 });

		const shinyEnvMap = new THREE.TextureLoader().load('/assets/textures/shiny-envMap.png');
		shinyEnvMap.mapping = THREE.SphericalReflectionMapping;
		shiny.envMap = shinyEnvMap;

		const shinyRoughnessMap = new THREE.TextureLoader().load('/assets/textures/shinyroughnessMap.png');
		shinyRoughnessMap.magFilter = THREE.NearestFilter;
		shiny.roughnessMap = shinyRoughnessMap;

		const sphereGeometry = new THREE.SphereGeometry(30, 64, 64);

		const ball = new THREE.Mesh(sphereGeometry, shiny);
		this.scene.add(ball);

		this.camera.position.z = 5;

		const animate = () => {
			requestAnimationFrame(animate);
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}

}
