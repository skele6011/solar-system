var scene = new THREE.Scene();
// Use a slightly different field of view for historical perspective
var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 20000);
// Default position adjusted for geocentric view
camera.position.set(0, 150, 300);
camera.lookAt(0, 0, 0);

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Orbit controls for the geocentric view
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 20;
controls.maxDistance = 5000; // Adjusted for geocentric scale

// Export controls to window so editors.js can access it
window.controls = controls;

// Similar lighting setup as heliocentric but with adjustments
scene.add(new THREE.AmbientLight(0x404040, 0.6));

// Add sun light that will now orbit around Earth
var sunLight = new THREE.PointLight(0xffffff, 2.5, 1500, 1.2);
sunLight.castShadow = true;
sunLight.shadow.bias = -0.0001;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Add hemisphere light for natural lighting
var hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
scene.add(hemiLight);

// Adjusted directional lights
var dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight.position.set(500, 500, 500);
scene.add(dirLight);

var dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
dirLight2.position.set(-500, 200, -500);
scene.add(dirLight2);

// Fill light to illuminate dark sides
var fillLight = new THREE.DirectionalLight(0x404060, 0.3);
fillLight.position.set(0, -400, 0);
scene.add(fillLight);

// Texture loader
var textureLoader = new THREE.TextureLoader();

// Create star background
var starGeometry = new THREE.BufferGeometry();
var starMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.6,
    transparent: true,
    opacity: 0.8,
    map: textureLoader.load('../textures/star.png'),
    blending: THREE.AdditiveBlending
});

var starVertices = [];
for(let i = 0; i < 15000; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() * 0.3 + 0.85) * Math.PI/2 * (Math.random() < 0.5 ? 1 : -1);
    const radius = 1000 + Math.random() * 1000;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
var stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Initialize core variables
let speedMultiplier = 1;
let scaleMultiplier = 0.2;
let epicycleSize = 0.5;
let orbitalModel = 'geocentric'; // Default to geocentric for this page

// Expose variables to window
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.sunLight = sunLight;
window.scaleMultiplier = scaleMultiplier;
window.epicycleSize = epicycleSize;
window.orbitalModel = orbitalModel;

window.dispatchEvent(new Event('sceneready'));

// Animation function
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Access speedMultiplier from window to ensure we get the latest value
    const currentSpeed = window.speedMultiplier || speedMultiplier;
    
    if (typeof updateGeocentricPlanets === 'function') {
        updateGeocentricPlanets(currentSpeed);
    }
    
    renderer.render(scene, camera);
}
window.animate = animate;
animate();

// Window resize handler
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
