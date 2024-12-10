import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();

// Axes helper
const axesHelper = new THREE.AxesHelper( 100 );
scene.add( axesHelper );

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(1,1,5);
scene.add( camera );

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

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(window.innerWidth, window.innerHeight)

// Animation
function animate() {
    requestAnimationFrame(animate)

    // Rotate the spaceship
    spaceship.rotation.z += 0.01

    // rotate the cubes
    cube1.rotation.y += 0.01
    cube2.rotation.y += 0.02
    cube3.rotation.y += 0.03

    // Render
    renderer.render(scene, camera)
}

// Start animation
animate()
