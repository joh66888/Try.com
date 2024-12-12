import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Axes helper
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 6);
scene.add(camera);

// OrbitControls
const controls = new OrbitControls(camera, canvas)
// smooth movement
controls.enableDamping = true


// Group
const spaceship = new THREE.Group();
scene.add(spaceship);

// add cube
const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x30B030, wireframe: true })
);
spaceship.add(cube1);

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x2194CE, wireframe: true })
);
spaceship.add(cube2);

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff3399, wireframe: true })
);
spaceship.add(cube3);

// Cube postion
cube1.position.set(0, 0, 0);
cube2.position.set(0, 1.5, 0);
cube3.position.set(0, 3, 0);


camera.lookAt(spaceship.position);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(window.innerWidth, window.innerHeight)

// Clock
const clock = new THREE.Clock();

// Animate 設定下一個frame要做什麼
function animate() {

    // Clock
    const time = clock.getElapsedTime()

    // Transform
    spaceship.rotation.y = time;
    cube1.rotation.y = time;
    cube2.rotation.x = time;
    cube3.rotation.z = time;

    // Update controls for smooth movement
    controls.update();

    // Render after transform
    renderer.render(scene, camera);

    // Webbrowser will call this function 60 times per second
    requestAnimationFrame(animate);
}
animate();