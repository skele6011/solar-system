var scene = new THREE.Scene();
// Use a wider field of view for better system visibility
var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 20000);
// Default position adjusted for true scale view
camera.position.set(0, 200, 400);
camera.lookAt(0, 0, 0);

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Adjust orbit controls for the larger scale
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 30;
controls.maxDistance = 10000; // Increased to allow viewing the entire system

// Export controls to window so editors.js can access it
window.controls = controls;

// Better lighting setup
scene.add(new THREE.AmbientLight(0x404040, 0.6)); // Brighter ambient light

// Add sun point light with better distance
var sunLight = new THREE.PointLight(0xffffff, 2.5, 1500, 1.2); // Increased range
sunLight.castShadow = true;
sunLight.shadow.bias = -0.0001;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Add a hemisphere light for more natural lighting
var hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
scene.add(hemiLight);

// Adjust directional lights for better coverage
var dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight.position.set(500, 500, 500);
scene.add(dirLight);

var dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
dirLight2.position.set(-500, 200, -500);
scene.add(dirLight2);

// Add fill light to illuminate the dark sides of planets
var fillLight = new THREE.DirectionalLight(0x404060, 0.3);
fillLight.position.set(0, -400, 0);
scene.add(fillLight);

// Add slider controls
const controlPanel = document.createElement('div');
controlPanel.className = 'control-panel';
controlPanel.innerHTML = `
    <div class="dropdown-container">
        <label for="scaleMode">View Mode</label>
        <select id="scaleMode">
            <option value="visual">Visual (Compressed)</option>
            <option value="mixed">Semi-Realistic</option>
            <option value="true">True Scale (1 unit = 1M km)</option>
        </select>
    </div>
    <div class="slider-container">
        <label for="lightIntensity">Sun Light Intensity</label>
        <input type="range" id="lightIntensity" min="0" max="5" step="0.1" value="2.5">
    </div>
    <div class="slider-container">
        <label for="ambientLight">Ambient Light</label>
        <input type="range" id="ambientLight" min="0" max="2" step="0.1" value="0.6">
    </div>
    <div class="slider-container">
        <label for="animationSpeed">Animation Speed</label>
        <input type="range" id="animationSpeed" min="0" max="2" step="0.1" value="1">
    </div>
    <div class="slider-container">
        <label for="scaleMultiplier">Scale Realism</label>
        <input type="range" id="scaleMultiplier" min="0.1" max="1" step="0.05" value="0.2">
        <span>True 1:1 Scale →</span>
    </div>
`;
document.body.appendChild(controlPanel);

let speedMultiplier = 1;
let scaleMultiplier = 0.2; // Default scale is more visually appealing than true scale

// Add event listeners for sliders
document.getElementById('lightIntensity').addEventListener('input', function(e) {
    sunLight.intensity = parseFloat(e.target.value);
});

document.getElementById('animationSpeed').addEventListener('input', function(e) {
    speedMultiplier = parseFloat(e.target.value);
});

document.getElementById('scaleMultiplier').addEventListener('input', function(e) {
    scaleMultiplier = parseFloat(e.target.value);
    if (typeof window.updatePlanetScales === 'function') {
        window.updatePlanetScales(scaleMultiplier);
    } else {
        console.warn('updatePlanetScales function not available yet');
    }
});

// Add event listeners for additional lighting sliders
document.getElementById('ambientLight').addEventListener('input', function(e) {
    const value = parseFloat(e.target.value);
    scene.children.forEach(child => {
        if (child instanceof THREE.AmbientLight) {
            child.intensity = value;
        }
    });
});

// Add event listener for the scale mode dropdown
document.getElementById('scaleMode').addEventListener('change', function(e) {
    switch(e.target.value) {
        case 'visual':
            scaleMultiplier = 0.1;
            document.getElementById('scaleMultiplier').value = 0.1;
            camera.position.set(0, 120, 200);
            // Reset target to origin
            if (window.controls) {
                window.controls.target.set(0, 0, 0);
                window.controls.update();
            }
            break;
        case 'mixed':
            scaleMultiplier = 0.5;
            document.getElementById('scaleMultiplier').value = 0.5;
            camera.position.set(0, 300, 600); 
            // Reset target to origin
            if (window.controls) {
                window.controls.target.set(0, 0, 0);
                window.controls.update();
            }
            break;
        case 'true':
            scaleMultiplier = 1.0;
            document.getElementById('scaleMultiplier').value = 1.0;
            camera.position.set(0, 500, 1000);
            // Reset target to origin
            if (window.controls) {
                window.controls.target.set(0, 0, 0);
                window.controls.update();
            }
            break;
    }
    if (typeof window.updatePlanetScales === 'function') {
        window.updatePlanetScales(scaleMultiplier);
    }
});

var textureLoader = new THREE.TextureLoader();

// Create the sun with more realistic shader
var sunGeometry = new THREE.SphereGeometry(16, 64, 64);
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

// Enhanced sun glow effect
var sunGlowGeometry = new THREE.SphereGeometry(16.5, 64, 64);
var sunGlowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        c: { type: "f", value: 0.5 },
        p: { type: "f", value: 6.0 },
        glowColor: { type: "c", value: new THREE.Color(0xffddaa) },
        viewVector: { type: "v3", value: camera.position }
    },
    vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * viewVector);
            intensity = pow(abs(c - dot(vNormal, vNormel)), p);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4(glow, 1.0);
        }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
});

var sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
sunGlow.scale.set(2.0, 2.0, 2.0);
sun.add(sunGlow);
scene.add(sun);

// More realistic star distribution using a cube mapping
var starGeometry = new THREE.BufferGeometry();
var starMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.6,
    transparent: true,
    opacity: 0.8,
    map: textureLoader.load('textures/star.png'), // We'll assume there's a star particle texture
    blending: THREE.AdditiveBlending
});

var starVertices = [];
// Create more realistic star distribution - denser toward galactic plane
for(let i = 0; i < 15000; i++) {
    // Modified distribution to create galactic plane effect
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() * 0.3 + 0.85) * Math.PI/2 * (Math.random() < 0.5 ? 1 : -1);
    
    // More stars farther out
    const radius = 1000 + Math.random() * 1000;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
var stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Expose variables to window
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.sun = sun;
window.sunLight = sunLight;
window.scaleMultiplier = scaleMultiplier;

window.dispatchEvent(new Event('sceneready'));

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    sun.rotation.y += 0.004 * speedMultiplier;
    
    // Update sun glow effect based on camera position
    if (sunGlow.material.uniforms) {
        sunGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
            camera.position, sunGlow.position
        );
    }
    
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

// Ensure scaleMultiplier is applied after planets are created
window.addEventListener('load', function() {
    setTimeout(function() {
        if (typeof window.updatePlanetScales === 'function') {
            window.updatePlanetScales(scaleMultiplier);
        }
    }, 100); // Short delay to ensure planets.js has loaded
});

// Initial scale setting with slight delay to ensure everything is loaded
setTimeout(function() {
    // Start with a more visual mode by default for better first impression
    const initialScale = 0.2;
    document.getElementById('scaleMultiplier').value = initialScale;
    document.getElementById('scaleMode').value = 'visual';
    scaleMultiplier = initialScale;
    
    if (typeof window.updatePlanetScales === 'function') {
        window.updatePlanetScales(initialScale);
    }
}, 200);
