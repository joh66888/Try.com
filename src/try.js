import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js';

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// scene
const scene = new THREE.Scene();

// Textures
const textLoader = new THREE.TextureLoader();
const metalColorTexture = textLoader.load('./textures/metal/metal.jpg');
const metcapTexture = textLoader.load('./textures/matcaps/10.png');
const gradientTexture = textLoader.load('./textures/gradients/3.jpg');

metalColorTexture.colorSpace = THREE.SRGBColorSpace;
metcapTexture.colorSpace = THREE.SRGBColorSpace;
gradientTexture.colorSpace = THREE.SRGBColorSpace;

// 設定材質
const material = new THREE.MeshMatcapMaterial();
material.matcap = metcapTexture;

// Environment map
console.log('Starting to load HDR environment map...');
const rgbeLoader = new RGBELoader();
rgbeLoader.setDataType(THREE.HalfFloatType);

// Create a new PMREMGenerator
const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Load the HDR environment map
rgbeLoader.load(
    '/textures/environmentMap/universe2.hdr',
    function(texture) {
        console.log('HDR texture loaded, processing...');
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        
        scene.background = envMap;
        scene.environment = envMap;
        
        texture.dispose();
        pmremGenerator.dispose();
        
        console.log('Environment map setup complete');
    },
    function(progress) {
        console.log(`Loading progress: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
    },
    function(error) {
        console.error('Error loading HDR environment map:', error);
    }
);

// 設定太空船的參數
const radius = 100;
const spaceship_y = 0;
const max_size = 15;

// 設定太空艙的信息
const length = 20, width = 8;

const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(0, width);
shape.lineTo(length, width);
shape.lineTo(length, 0);
shape.lineTo(0, 0);

const extrudeSettings = {
    steps: 1,
    depth: 30,
    bevelEnabled: true,
    bevelThickness: 4,
    bevelSize: 2,
    bevelOffset: -4,
    bevelSegments: 1
};
const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

// 記錄上一次呼叫 updateCube 的時間
let lastUpdateTime = 0;

// Axes helper
// const axesHelper = new THREE.AxesHelper(100000);
// scene.add(axesHelper);

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 200, 100)
scene.add(camera);

// 創建控制器 -> smooth by enableDamping
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// 建立太空船陣列
const spaceship = new THREE.Group();
spaceship.position.set(0, spaceship_y, 0);
scene.add(spaceship);

// Adjust canvas on resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function updateCubes(spaceship, radius) {

    // 創建太空艙
    const cube = new THREE.Mesh(geometry, material);
    spaceship.add(cube);

    // 分割圓形
    const cubeCount = spaceship.children.length;
    const angleDivide = (Math.PI * 2) / cubeCount;

    // 分配座標
    spaceship.children.forEach((cube, i) => {
        const angle = i * angleDivide;
        cube.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
        // 設定朝向太空船中心
        cube.lookAt(0, spaceship_y, 0);
    })
    console.log("complete reset coordinate")
}

const clock = new THREE.Clock()

function animate() {
    // Update controls for smooth movement
    controls.update()

    // Get elapsed time
    const elapsedTime = clock.getElapsedTime();

    // Update cubes at 0.3-second intervals
    if (elapsedTime - lastUpdateTime >= 0.05 && spaceship.children.length < max_size) {
        updateCubes(spaceship, radius);
        lastUpdateTime = elapsedTime; // 更新上次執行時間
    }

    // Update each cube's rotation
    spaceship.children.forEach((cube) => {
        const rotationSpeed = cube.userData.rotationSpeed || 0.01; // 默認旋轉速度
        cube.rotation.z += rotationSpeed; // 圓周旋轉
    });

    // Transform spaceship
    const time = clock.getElapsedTime();
    spaceship.rotation.y = time / 3;

    // Render
    renderer.render(scene, camera);

    //Cascade calling next frame
    requestAnimationFrame(animate)
}

animate();