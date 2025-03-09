var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.set(0, 150, 250);
camera.lookAt(0, 0, 0);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 50;
controls.maxDistance = 500;

// Export controls to window so editors.js can access it
window.controls = controls;

scene.add(new THREE.AmbientLight(0x333333));
var pointLight = new THREE.PointLight(0xffffff, 3, 1000);
scene.add(pointLight);

// Add slider controls
const controlPanel = document.createElement('div');
controlPanel.className = 'control-panel';
controlPanel.innerHTML = `
    <div class="slider-container">
        <label for="lightIntensity">Light Intensity</label>
        <input type="range" id="lightIntensity" min="0" max="5" step="0.1" value="3">
    </div>
    <div class="slider-container">
        <label for="animationSpeed">Animation Speed</label>
        <input type="range" id="animationSpeed" min="0" max="2" step="0.1" value="1">
    </div>
`;
document.body.appendChild(controlPanel);

let speedMultiplier = 1;

// Add event listeners for sliders
document.getElementById('lightIntensity').addEventListener('input', function(e) {
    pointLight.intensity = parseFloat(e.target.value);
});

document.getElementById('animationSpeed').addEventListener('input', function(e) {
    speedMultiplier = parseFloat(e.target.value);
});

var textureLoader = new THREE.TextureLoader();

var sunGeometry = new THREE.SphereGeometry(16, 32, 32);
var sunMaterial = new THREE.MeshBasicMaterial({ 
    map: textureLoader.load('textures/8k_sun.jpg')
});
var sun = new THREE.Mesh(sunGeometry, sunMaterial);
// Add sun data for info panel
sun.userData = {
    name: "Sun",
    description: "The star at the center of our Solar System. It's a nearly perfect sphere of hot plasma that provides most of the energy for life on Earth.",
    diameter: "Approximately 1,392,700 km (109 times Earth's diameter)",
    orbitalPeriod: "The Sun orbits the center of the Milky Way galaxy, taking about 225-250 million years",
    dayLength: "Rotates in about 25-35 days, varying by latitude due to its gaseous nature"
};

// Add sun glow
var sunGlowGeometry = new THREE.SphereGeometry(16.5, 32, 32);
var sunGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffddaa,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
});
var sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
sunGlow.scale.set(1.2, 1.2, 1.2);
sun.add(sunGlow);
scene.add(sun);

var starGeometry = new THREE.BufferGeometry();
var starMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.5
});

var starVertices = [];
for(let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
var stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.sun = sun;

window.dispatchEvent(new Event('sceneready'));

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    sun.rotation.y += 0.004 * speedMultiplier;
    if (typeof updatePlanets === 'function') {
        updatePlanets(speedMultiplier);
    }
    renderer.render(scene, camera);
}
window.animate = animate; // Expose the animate function
animate();

window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
