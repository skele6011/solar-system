// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
// Wider field of view for better visibility of the large-scale model
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 25000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Background
scene.background = new THREE.Color(0x000000);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Add point light at the sun's position with increased range
const sunLight = new THREE.PointLight(0xffffff, 1.5, 15000);
scene.add(sunLight);

// Add directional light to better illuminate planets far from the sun
const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight.position.set(1, 1, 1);
scene.add(dirLight);

// Set up the camera position - adjusted for the larger scale
camera.position.z = 1000;
camera.position.y = 800;

// Add orbit controls with adjusted limits
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 50;   // Allow closer zoom to see Earth
controls.maxDistance = 20000; // Allow further zoom to see the entire system

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Animation loop with adaptive speed
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Update planet positions
    if (typeof updatePlanets === 'function') {
        updatePlanets();
    }
    
    renderer.render(scene, camera);
}

// Enhanced star background for better depth and realism
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 8000;  // More stars for better immersion
    
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        // Create a spherical distribution
        const radius = 20000 + Math.random() * 5000;  // Increased distance for larger scale
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
        
        // Vary the star sizes
        sizes[i/3] = Math.random() * 1.5 + 0.5;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        size: 1.5  // Larger stars for visibility
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

createStars();
animate();
