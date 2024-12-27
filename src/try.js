import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js';
import { updateLoadingText } from './loading-text-animation.js'; 

import { gsap } from 'gsap';

// Loaders
const loadingbar = document.querySelector('.loading-bar');
const loadingtext = document.querySelector('.loading-text');
const rgbeLoader = new RGBELoader();

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();

// Overlay Shader
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Adjust canvas on resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Textures
const textLoader = new THREE.TextureLoader();
const metcapTexture = textLoader.load('./textures/matcaps/10.png');
metcapTexture.colorSpace = THREE.SRGBColorSpace;

// Material
const material = new THREE.MeshMatcapMaterial();
material.matcap = metcapTexture;

// Load the HDR environment map
// Create a new PMREMGenerator
const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Load the HDR environment map

// 記錄開始時間
const startTime = performance.now();

rgbeLoader.setDataType(THREE.HalfFloatType);
rgbeLoader.load(
    './textures/environmentMap/universe.hdr',
    (texture) => {
        // 下載進度
        const progressRatio = texture.loaded / texture.total;
        console.log("loaded progressRatio: "+progressRatio);

        gsap.delayedCall(0.5, () => {
            const downloadEndTime = performance.now();
            console.log(`HDR environment map download complete in ${(downloadEndTime - startTime).toFixed(2)}ms`);

            // 處理進度模擬
            const processStartTime = performance.now();

            // 正式處理貼圖
            texture.mapping = THREE.EquirectangularReflectionMapping;
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;

            scene.background = envMap;
            scene.environment = envMap;

            texture.dispose();
            pmremGenerator.dispose();

            const processEndTime = performance.now();
            console.log(`HDR environment map processed in ${(processEndTime - processStartTime).toFixed(2)}ms`);
            console.log(`Total time: ${(processEndTime - startTime).toFixed(2)}ms`);

            // 更新 loading bar: remove loading bar transform style & add ended class
            loadingbar.classList.add('ended');
            loadingbar.style.transform = ``;
      
            // 動畫完成 overlay 消失
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
        });
    },
    (xhr) => {
        // 下載進度
        const progressRatio = xhr.loaded / xhr.total;
        console.log("progressing progressRatio: "+progressRatio);

        // 更新 loading bar
        loadingbar.style.transform = `scaleX(${progressRatio})`;
        
        // 使用 GSAP 更新 loading text
        updateLoadingText(progressRatio, loadingtext);
    },
    (error) => {
        // 加載失敗
        console.error('An error occurred while loading the HDR environment map:', error);
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

// 建立太空船陣列
const spaceship = new THREE.Group();
spaceship.position.set(0, spaceship_y, 0);
scene.add(spaceship);

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 200, 100)
scene.add(camera);

// 創建控制器 -> smooth by enableDamping
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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
}

// 記錄上一次呼叫 updateCube 的時間
let lastUpdateTime = 0;
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

animate()