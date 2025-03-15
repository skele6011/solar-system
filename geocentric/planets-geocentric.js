// Planetary data in the geocentric model
const planetData = {
    earth: {
        radius: 10,
        texture: '../textures/8k_earth_daymap.jpg',
        position: { x: 0, y: 0, z: 0 }
    },
    moon: {
        radius: 2.7,
        texture: '../textures/moon.jpg',
        orbitRadius: 30,  // Increased from 0.3844 for visibility
        orbitSpeed: 0.015  // Adjusted speed
    },
    sun: {
        radius: 1000,
        texture: '../textures/8k_sun.jpg',
        orbitRadius: 1500,  // Adjusted from 149.6 for better visualization
        orbitSpeed: 0.0025  // Slower speed for the large sun
    },
    mercury: {
        radius: 3.8,
        texture: '../textures/8k_mercury.jpg',
        orbitRadius: 600,  // Adjusted from 57.9
        orbitSpeed: 0.004  // Adjusted speed
    },
    venus: {
        radius: 9.5,
        texture: '../textures/8k_venus_surface.jpg',
        orbitRadius: 1100,  // Adjusted from 108.2
        orbitSpeed: 0.003  // Adjusted speed
    },
    mars: {
        radius: 5.3,
        texture: '../textures/8k_mars.jpg',
        orbitRadius: 2300,  // Adjusted from 227.9
        orbitSpeed: 0.002  // Adjusted speed
    },
    jupiter: {
        radius: 100,
        texture: '../textures/8k_jupiter.jpg',
        orbitRadius: 3900,  // Adjusted from 778.5
        orbitSpeed: 0.001  // Adjusted speed
    },
    saturn: {
        radius: 84.5,
        texture: '../textures/8k_saturn.jpg',
        orbitRadius: 5000,  // Adjusted from 1433.5
        orbitSpeed: 0.0006  // Adjusted speed
    },
    uranus: {
        radius: 30,
        texture: '../textures/2k_uranus.jpg',
        orbitRadius: 6200,  // Adjusted from 2872.5
        orbitSpeed: 0.0004  // Maintained speed
    },
    neptune: {
        radius: 25.8,
        texture: '../textures/2k_neptune.jpg',
        orbitRadius: 7500,  // Adjusted from 4495.1
        orbitSpeed: 0.0002  // Adjusted speed
    }
};

const scaleFactor = 1;
const planets = {};
const orbits = {};
let angles = {};

// Create planets and their orbits with optimized rendering
function createPlanets() {
    // Create the Earth (center)
    const earthGeometry = new THREE.SphereGeometry(planetData.earth.radius, 32, 32);
    const earthTexture = new THREE.TextureLoader().load(planetData.earth.texture);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    planets.earth = new THREE.Mesh(earthGeometry, earthMaterial);

    // Add cloud layer to Earth
    const cloudGeometry = new THREE.SphereGeometry(planetData.earth.radius * 1.02, 32, 32);
    const cloudTexture = new THREE.TextureLoader().load('../textures/8k_earth_clouds.jpg');
    const cloudMaterial = new THREE.MeshStandardMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.7
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planets.earth.add(clouds);

    scene.add(planets.earth);
    
    // Create all other celestial bodies
    Object.keys(planetData).forEach(name => {
        if (name === 'earth') return;
        
        // Create the planet with appropriate detail level
        const planet = planetData[name];
        // Adjust the geometry segments based on planet size
        const segments = name === 'sun' ? 64 : 
                         (name === 'jupiter' || name === 'saturn') ? 48 : 32;
        const geometry = new THREE.SphereGeometry(planet.radius * scaleFactor, segments, segments);
        const texture = new THREE.TextureLoader().load(planet.texture);
        
        // Use appropriate material for each planet
        let material;
        if (name === 'sun') {
            material = new THREE.MeshBasicMaterial({ map: texture }); // Emissive material for sun
        } else {
            material = new THREE.MeshStandardMaterial({ 
                map: texture,
                roughness: 0.7,  // Better surface appearance
                metalness: 0.2   // Slight reflection for planets
            });
        }
        
        planets[name] = new THREE.Mesh(geometry, material);
        
        // Add rings for Saturn
        if (name === 'saturn') {
            const ringGeometry = new THREE.RingGeometry(
                planet.radius * scaleFactor * 1.4, 
                planet.radius * scaleFactor * 2.2, 
                64);
            const ringTexture = new THREE.TextureLoader().load('../textures/8k_saturn_ring_alpha.png');
            const ringMaterial = new THREE.MeshBasicMaterial({
                map: ringTexture,
                transparent: true,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2.5; // Tilt the rings
            planets[name].add(ring);
        }
        
        // Add to scene
        scene.add(planets[name]);
        
        // Initialize angle with natural spacing between planets
        angles[name] = (2 * Math.PI * Object.keys(angles).length) / 
                       (Object.keys(planetData).length - 1);
        
        // Create orbit path with adjusted width based on distance
        const orbitWidth = planet.orbitRadius * scaleFactor * 0.01; // Scale width with orbit size
        const orbitGeometry = new THREE.RingGeometry(
            planet.orbitRadius * scaleFactor - orbitWidth, 
            planet.orbitRadius * scaleFactor + orbitWidth, 
            128); // Higher segment count for smoother orbits
        
        const orbitMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2 // Subtle orbit lines
        });
        orbits[name] = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbits[name].rotation.x = Math.PI / 2;
        scene.add(orbits[name]);
        
        // If it's the Sun, add it as a light source
        if (name === 'sun') {
            // Add a glow effect for the sun
            const sunGlowGeometry = new THREE.SphereGeometry(planet.radius * scaleFactor * 1.2, 32, 32);
            const sunGlowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffddaa,
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide
            });
            const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
            planets[name].add(sunGlow);
            
            // Position the sunlight
            sunLight.position.set(
                Math.cos(angles.sun) * planet.orbitRadius * scaleFactor,
                0,
                Math.sin(angles.sun) * planet.orbitRadius * scaleFactor
            );
        }
    });
}

// Update planet positions during animation with smooth movement
function updatePlanets() {
    // Update positions of all celestial bodies
    Object.keys(planetData).forEach(name => {
        if (name === 'earth') return;
        
        const planet = planetData[name];
        
        // Update angle with speed adjusted by currentSpeedFactor from UI
        const speedFactor = window.currentSpeedFactor || 1;
        angles[name] += planet.orbitSpeed * speedFactor;
        
        // Calculate new position
        const x = Math.cos(angles[name]) * planet.orbitRadius * scaleFactor;
        const z = Math.sin(angles[name]) * planet.orbitRadius * scaleFactor;
        
        // Update planet position
        planets[name].position.set(x, 0, z);
        
        // Add slight rotation to planets
        if (planets[name]) {
            planets[name].rotation.y += planet.orbitSpeed * 0.5 * speedFactor;
        }
        
        // If it's the Sun, update light position too
        if (name === 'sun') {
            sunLight.position.set(x, 0, z);
        }
    });
    
    // Make Earth rotate
    planets.earth.rotation.y += 0.005;
    
    // Make the Earth clouds rotate slightly faster than the Earth
    if (planets.earth.children && planets.earth.children[0]) {
        planets.earth.children[0].rotation.y += 0.0055;
    }
}

// Initialize
createPlanets();
