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

// Create UI container for better organization
const uiContainer = document.createElement('div');
uiContainer.className = 'ui-container';
document.body.appendChild(uiContainer);

// Add refresh button
const refreshButton = document.createElement('div');
refreshButton.className = 'refresh-button';
refreshButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
`;
refreshButton.title = "Reset Simulation";
uiContainer.appendChild(refreshButton);

// Add slider controls
const controlPanel = document.createElement('div');
controlPanel.className = 'control-panel';
controlPanel.innerHTML = `
    <div class="dropdown-container">
        <label for="orbitalModel">Orbital Model</label>
        <select id="orbitalModel">
            <option value="heliocentric">Heliocentric Model (Modern)</option>
            <option value="geocentric" selected>Geocentric Model (Historical)</option>
        </select>
    </div>
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
uiContainer.appendChild(controlPanel);

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

// Add event listener for the orbital model dropdown
document.getElementById('orbitalModel').addEventListener('change', function(e) {
    const newModel = e.target.value;
    
    // Redirect to appropriate page based on model
    if (newModel === 'heliocentric') {
        // Save any state if needed before redirecting
        localStorage.setItem('returnToScale', window.scaleMultiplier);
        
        // Redirect to main heliocentric model
        window.location.href = '../index.html';
    } else {
        // Already on geocentric page, no need to redirect
        modelIndicator.textContent = 'Model: Geocentric (Historical)';
    }
});

var textureLoader = new THREE.TextureLoader();

// Create the sun with more realistic shader
var sunGeometry = new THREE.SphereGeometry(16, 64, 64);
var sunMaterial = new THREE.MeshBasicMaterial({ 
    map: textureLoader.load('../textures/8k_sun.jpg')
});
var sun = new THREE.Mesh(sunGeometry, sunMaterial);
// Add sun data for info panel
sun.userData = {
    name: "Sun",
    description: "In the geocentric model, the Sun revolves around the Earth. Historically considered the fourth 'planet' orbiting Earth after the Moon, Mercury, and Venus.",
    diameter: "Approximately 1,392,700 km",
    orbitalPeriod: "About 365.25 days around Earth (in geocentric model)",
    dayLength: "Rotates in about 25-35 days"
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
    map: textureLoader.load('../textures/star.png'),
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
window.uiContainer = uiContainer;

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

// Add scale indicator to show current scale
const scaleIndicator = document.createElement('div');
scaleIndicator.className = 'scale-indicator';
scaleIndicator.textContent = 'Scale: Visual Mode';
uiContainer.appendChild(scaleIndicator);

// Update scale indicator when scale changes
function updateScaleIndicator(scale) {
    let scaleText = '';
    if (scale <= 0.2) {
        scaleText = 'Scale: Visual Mode';
    } else if (scale >= 0.8) {
        scaleText = 'Scale: True 1:1 (1 unit = 1M km)';
    } else {
        scaleText = 'Scale: Semi-Realistic';
    }
    scaleIndicator.textContent = scaleText;
}

// Add scale indicator update to scale change events
document.getElementById('scaleMultiplier').addEventListener('input', function(e) {
    updateScaleIndicator(parseFloat(e.target.value));
});

document.getElementById('scaleMode').addEventListener('change', function(e) {
    let scaleValue;
    switch(e.target.value) {
        case 'visual': scaleValue = 0.1; break;
        case 'mixed': scaleValue = 0.5; break;
        case 'true': scaleValue = 1.0; break;
    }
    updateScaleIndicator(scaleValue);
});

// Initial update
updateScaleIndicator(scaleMultiplier);

// Add model indicator to show current model
const modelIndicator = document.createElement('div');
modelIndicator.className = 'scale-indicator';
modelIndicator.style.bottom = '50px'; // Position below scale indicator
modelIndicator.textContent = 'Model: Geocentric (Historical)';
uiContainer.appendChild(modelIndicator);

// Add refresh button functionality
refreshButton.addEventListener('click', function() {
    refreshButton.style.transition = 'transform 0.5s ease';
    refreshButton.style.transform = 'rotate(360deg)';
    
    setTimeout(() => {
        refreshButton.style.transition = 'none';
        refreshButton.style.transform = 'rotate(0deg)';
        resetSimulation();
    }, 500);
});

// Function to reset the simulation
function resetSimulation() {
    console.log("Starting simulation reset...");
    
    // Reset camera position
    camera.position.set(0, 200, 400);
    camera.lookAt(0, 0, 0);
    
    // Reset orbit controls
    if (window.controls) {
        controls.target.set(0, 0, 0);
        controls.update();
    }
    
    // Reset to default scale
    const initialScale = 0.2;
    document.getElementById('scaleMultiplier').value = initialScale;
    document.getElementById('scaleMode').value = 'visual';
    scaleMultiplier = initialScale;
    updateScaleIndicator(initialScale);
    
    // Reset the planets
    if (typeof window.resetPlanetPositions === 'function') {
        window.resetPlanetPositions();
    }
    
    // Reset planet scales
    if (typeof window.updatePlanetScales === 'function') {
        window.updatePlanetScales(initialScale);
    }
    
    // Reset animation speed
    document.getElementById('animationSpeed').value = 1;
    speedMultiplier = 1;
    
    // Reset lighting
    document.getElementById('lightIntensity').value = 2.5;
    sunLight.intensity = 2.5;
    
    document.getElementById('ambientLight').value = 0.6;
    scene.children.forEach(child => {
        if (child instanceof THREE.AmbientLight) {
            child.intensity = 0.6;
        }
    });
    
    console.log("Simulation reset complete");
}

// Expose the reset function to the window
window.resetSimulation = resetSimulation;

// Check if we should restore a scale from previous session
document.addEventListener('DOMContentLoaded', function() {
    const savedScale = localStorage.getItem('returnToScale');
    if (savedScale) {
        const scale = parseFloat(savedScale);
        scaleMultiplier = scale;
        document.getElementById('scaleMultiplier').value = scale;
        updateScaleIndicator(scale);
        
        // Clear saved scale after using it
        localStorage.removeItem('returnToScale');
        
        // Apply after planets are created
        setTimeout(function() {
            if (typeof window.updatePlanetScales === 'function') {
                window.updatePlanetScales(scale);
            }
        }, 200);
    }
});
