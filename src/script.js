import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Axes helper
const axesHelper = new THREE.AxesHelper( 100 );
scene.add( axesHelper );

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight)
camera.position.z = 6
scene.add(camera)

/**
 * Objects
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Transform part
// Positions
camera.position.set(1, 1, 6)
mesh.position.set(0.5, 0, 1)

// LookAt
camera.lookAt(mesh.position)

// Scale
mesh.scale.set(1, 2, 2)

// Rotation 務必加入 reorder，確保旋轉順序不亂掉
mesh.rotation.reorder('YXZ')
mesh.rotation.set(Math.PI * 0.25, Math.PI * 0.25, 0)

 
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)