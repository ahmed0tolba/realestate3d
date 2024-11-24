// Show loading bar and text
const loadingBar = document.getElementById('loading-bar');
loadingBar.style.display = 'block';

// var isFlying = false;
var startButton = document.getElementById('start-button');
var stopButton = document.getElementById('stop-button');

// Define camera positions
const cameraPositions = [
    { position: new THREE.Vector3(1, 10, 20), rotation: new THREE.Euler(0, 0, 0) },
    { position: new THREE.Vector3(1, 10, -20), rotation: new THREE.Euler(0, Math.PI / 4, 0) },
    { position: new THREE.Vector3(-20, 10, 1), rotation: new THREE.Euler(0, 0, 0) },
    { position: new THREE.Vector3(20, 10, 1), rotation: new THREE.Euler(0, 0, 0) },
    { position: new THREE.Vector3(1, 20, 1), rotation: new THREE.Euler(0, 0, 0) },
    { position: new THREE.Vector3(3, -3, -3), rotation: new THREE.Euler(0, 0, 0) }
];

// const geometry = new THREE.SphereGeometry(0.5, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

// Define fly-through points
const points = [
    { position: new THREE.Vector3(-1, -3, -10), rotation: new THREE.Euler(0, -Math.PI, 0) },
    { position: new THREE.Vector3(-1, -3, 0), rotation: new THREE.Euler(0, -Math.PI, 0) },
    { position: new THREE.Vector3(-1, -3, 0), rotation: new THREE.Euler(0, -Math.PI/4, 0) },
    { position: new THREE.Vector3(-1, -3, 0), rotation: new THREE.Euler(0, Math.PI/2, 0) },
    { position: new THREE.Vector3(-1, -3, 0), rotation: new THREE.Euler(0, -Math.PI, 0) },
    { position: new THREE.Vector3(0, -3, 1), rotation: new THREE.Euler(0, -Math.PI, 0) },
    { position: new THREE.Vector3(0, -1, 6), rotation: new THREE.Euler(0, -Math.PI, 0) },
    { position: new THREE.Vector3(0, -1, 6), rotation: new THREE.Euler(0, -3*Math.PI/2, 0) },
    { position: new THREE.Vector3(-1.5, -1, 6), rotation: new THREE.Euler(0, -4*Math.PI/2, 0) },
    { position: new THREE.Vector3(-1.5, 1, 1), rotation: new THREE.Euler(0, -4*Math.PI/2, 0) },
    { position: new THREE.Vector3(-1.5, 1, 1), rotation: new THREE.Euler(0, -5*Math.PI/2, 0) },
    { position: new THREE.Vector3(-1.5, 1, 1), rotation: new THREE.Euler(0, -4*Math.PI/2, 0) },
    { position: new THREE.Vector3(-1.5, 1, -6), rotation: new THREE.Euler(0, -4*Math.PI/2, 0) },
    { position: new THREE.Vector3(-1, -3, -20), rotation: new THREE.Euler(0, -Math.PI, 0) },

    
];

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add visual markers for points
// points.forEach(point => {
//     const marker = new THREE.Mesh(geometry, material);
//     marker.position.copy(point.position);
//     scene.add(marker);
// });

const cubeTextureLoader = new THREE.CubeTextureLoader();
const skyBoxTexture = cubeTextureLoader.load([
    'objects/house2/SkyBox02b0002.png',   // right
    'objects/house2/SkyBox02b0004.png',   // left
    'objects/house2/SkyBox02b0005.png',   // top
    'objects/house2/SkyBox02b0006.png',   // bottom
    'objects/house2/SkyBox02b0001.png',   // front
    'objects/house2/SkyBox02b0003.png'    // back
]);
scene.background = skyBoxTexture;

// Lighting
const ambientLight = new THREE.AmbientLight(0xa0a0a0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, .8);
directionalLight.position.set(-2, 20, -2);
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 25;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// Load MTL
const loader = new THREE.MTLLoader();
loader.load('objects/house2/m.mtl', function (materials) {
    materials.preload();
    // Load OBJ
    const objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('objects/house2/m.obj', function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.side = THREE.DoubleSide;
                child.material.shadowSide = THREE.DoubleSide;
            }
        });
        scene.add(object);
        loadingBar.style.display = 'none'; // Hide loading bar after load
    }, function (xhr) {
        // Update progress
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        progressBar.style.width = percentComplete.toFixed(0) + '%';
        progressText.textContent = percentComplete.toFixed(0) + '%';
    }, function (error) {
        console.error('Error loading model:', error);
        loadingBar.style.display = 'none'; // Hide loading bar on error
        alert('An error occurred while loading the model.');
    });
});

// Load a texture for the floor
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('objects/house2/169_PRATO.bmp');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);
// Optional: Adjust texture filtering
floorTexture.minFilter = THREE.LinearFilter;
floorTexture.magFilter = THREE.LinearFilter;
// Optional: Disable mipmapping
floorTexture.generateMipmaps = false;
const planeMaterial = new THREE.MeshPhongMaterial({ map: floorTexture });
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const floodTile = new THREE.Mesh(planeGeometry, planeMaterial);
floodTile.rotation.x = -Math.PI / 2; // Rotate to lie flat
floodTile.position.y = -4.1; // Position at z=0
scene.add(floodTile);

// Camera position
camera.position.x = -20;
camera.position.y = -1;
camera.position.z = 2;

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.minDistance = 1;// Set the minimum distance
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.maxDistance = 40;  // Set the maximum distance

const minCameraHeight = -4;
var damping = 0.05;

controls.target.set(0, -2, 0);

controls.addEventListener('change', function () {
    if (camera.position.y < minCameraHeight) {
        var previousY = camera.position.y;
        camera.position.y = minCameraHeight;
        var deltaY = minCameraHeight - previousY;
        controls.target.y -= deltaY * damping; // Adjust the damping factor as needed
    }
});

// Fly-through animation logic
let isAnimating = false;
let currentTween = null;
let index = 0;

// Render loop
function animate() {
    requestAnimationFrame(animate);

    TWEEN.update();
    if (!isAnimating) {
        controls.update();
    }
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function tweenToPosition(target) {
    // const target = cameraPositions[index];
    

    new TWEEN.Tween(camera.position)
        .to({ x: target.position.x, y: target.position.y, z: target.position.z }, 4000)
        .easing(TWEEN.Easing.Quadratic.InOut)                
        .start();

    new TWEEN.Tween(camera.rotation)
        .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, 4000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
}

// Fly-through animation
function startFlyThrough() {
    if (!isAnimating) {
        isAnimating = true;
        controls.enabled = false;
        let index = 0;
        function animateToPoint() {
            if (isAnimating) {
                if (index >= points.length) {stop_fly();return;}
                tweenToPosition(points[index++]);
                setTimeout(animateToPoint, 4000);
            }
        }
        animateToPoint();
    }
}

function stop_fly() {
    controls.enabled = true;
    if (isAnimating) {
        isAnimating = false;
        index = 0; // Restart animation        
    }
}

document.getElementById('start-button').addEventListener('click', () => { stop_fly(); startFlyThrough(); });
document.getElementById('stop-button').addEventListener('click', () => { stop_fly(); });
document.getElementById('front').addEventListener('click', () => { stop_fly(); tweenToPosition(cameraPositions[0]) });
document.getElementById('back').addEventListener('click', () => { stop_fly(); tweenToPosition(cameraPositions[1]) });
document.getElementById('left').addEventListener('click', () => { stop_fly(); tweenToPosition(cameraPositions[2]) });
document.getElementById('right').addEventListener('click', () => { stop_fly(); tweenToPosition(cameraPositions[3]) });
document.getElementById('roof').addEventListener('click', () => { stop_fly(); tweenToPosition(cameraPositions[4]) });
document.getElementById('interior').addEventListener('click', () => { stop_fly(); tweenToPosition(cameraPositions[5]) });




// Made by ahmed tolba ahmed0waves@gmail.com https://wa.me/+201146838391