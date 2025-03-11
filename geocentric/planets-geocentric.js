var planets = [];
var planetsData = [
    { 
        name: 'Mercury', 
        distance: 10, 
        size: 3, 
        speed: 0.04, 
        color: 0x808080,
        description: 'In the geocentric model, Mercury orbits around Earth with complex epicycles, making it appear to occasionally move backward in the sky.',
        diameter: 'Approximately 4,880 km',
        orbitalPeriod: '88 Earth days (observed)',
        dayLength: 'Unknown to ancient astronomers'
    },
    { 
        name: 'Venus', 
        distance: 18, 
        size: 5.8, 
        speed: 0.025, 
        color: 0xffd700,
        description: 'In the geocentric model, Venus was believed to orbit Earth closer than the Sun did, as it always appears near the Sun from Earth\'s perspective.',
        diameter: 'Approximately 12,104 km',
        orbitalPeriod: '225 Earth days (observed)',
        dayLength: 'Unknown to ancient astronomers'
    },
    { 
        name: 'Earth', 
        distance: 0, 
        size: 6, 
        speed: 0, 
        color: 0x4169e1,
        description: 'In the geocentric model, Earth is stationary at the center of the universe, with all celestial bodies revolving around it.',
        diameter: 'The standard of measurement',
        orbitalPeriod: 'N/A (stationary)',
        dayLength: '24 hours'
    },
    { 
        name: 'Mars', 
        distance: 36, 
        size: 4, 
        speed: 0.015, 
        color: 0xff4500,
        description: 'In the geocentric model, Mars orbits around Earth. Its retrograde motion was explained using epicycles - smaller orbits along its main orbit.',
        diameter: 'Approximately 6,779 km',
        orbitalPeriod: '687 Earth days (observed)',
        dayLength: 'Unknown to ancient astronomers'
    },
    { 
        name: 'Jupiter', 
        distance: 70, 
        size: 15, 
        speed: 0.008, 
        color: 0xffa500,
        description: 'In the geocentric model, Jupiter was one of the "wandering stars" orbiting Earth. Its slow movement across the sky reflected its outer position.',
        diameter: 'Approximately 139,820 km',
        orbitalPeriod: 'About 12 Earth years',
        dayLength: 'Unknown to ancient astronomers'
    },
    { 
        name: 'Saturn', 
        distance: 100, 
        size: 12, 
        speed: 0.005, 
        color: 0xffd700,
        description: 'In the geocentric model, Saturn was the most distant known planet, orbiting around a stationary Earth in the outermost sphere before the fixed stars.',
        diameter: 'Approximately 116,460 km',
        orbitalPeriod: 'About 29.5 Earth years',
        dayLength: 'Unknown to ancient astronomers'
    }
    // Uranus and Neptune weren't known in ancient times
];

// Store original scales and positions
var originalScales = [];
var originalPositions = {};

// Geocentric model distances (scaled for visualization with proper separation)
const geocentricDistances = {
    'Moon': 15,        // Increased for better visibility
    'Mercury': 40,     // Further increased spacing
    'Venus': 70,       // More spacing between planets
    'Sun': 100,        // Key position in geocentric model
    'Mars': 160,       // Much wider spacing for outer planets
    'Jupiter': 240,    // Increased substantially
    'Saturn': 360      // More distance from Jupiter
};

// Store scaled versions of geocentric distances for dynamic scaling
let scaledGeocentricDistances = {...geocentricDistances};

function updateGeocentricScales(scaleMultiplier) {
    // Different scaling for different scale ranges
    let scaleFactor;
    
    if (scaleMultiplier < 0.3) {
        // Visual mode - compress distances slightly, but maintain separation
        scaleFactor = 0.7 + scaleMultiplier * 0.5; // Higher minimum to prevent overlap
    } else if (scaleMultiplier >= 0.8) {
        // True scale mode - expand distances for realism
        scaleFactor = 1 + scaleMultiplier * 2;
    } else {
        // Mixed mode - balanced scaling with better separation
        scaleFactor = 0.9 + scaleMultiplier * 1.2;
    }
    
    // Apply scaling to all distances, maintaining geocentric model's structure
    Object.keys(geocentricDistances).forEach(key => {
        // Apply progressive spacing factor - bodies further out get more space
        let progressiveFactor = 1.0;
        
        // Each celestial body gets its own spacing factor
        switch(key) {
            case 'Moon': 
                // Keep Moon close to Earth but ensure visibility
                scaledGeocentricDistances[key] = geocentricDistances[key] * (0.6 + scaleMultiplier * 1.2);
                break;
            case 'Mercury':
                progressiveFactor = 1.05;
                scaledGeocentricDistances[key] = geocentricDistances[key] * scaleFactor * progressiveFactor;
                break;
            case 'Venus':
                progressiveFactor = 1.1;
                scaledGeocentricDistances[key] = geocentricDistances[key] * scaleFactor * progressiveFactor;
                break;
            case 'Sun':
                progressiveFactor = 1.15;
                scaledGeocentricDistances[key] = geocentricDistances[key] * scaleFactor * progressiveFactor;
                break;
            case 'Mars':
                progressiveFactor = 1.2;
                scaledGeocentricDistances[key] = geocentricDistances[key] * scaleFactor * progressiveFactor;
                break;
            case 'Jupiter':
                progressiveFactor = 1.25;
                scaledGeocentricDistances[key] = geocentricDistances[key] * scaleFactor * progressiveFactor;
                break;
            case 'Saturn':
                progressiveFactor = 1.3;
                scaledGeocentricDistances[key] = geocentricDistances[key] * scaleFactor * progressiveFactor;
                break;
            default:
                scaledGeocentricDistances[key] = geocentricDistances[key] * scaleFactor;
        }
    });
    
    // Update orbit lines to reflect new distances
    updateOrbitLines();
}

// Create celestial bodies for the geocentric model
function createPlanets() {
    var textureLoader = new THREE.TextureLoader();
    
    // Create Earth first (it's at the center)
    var earthData = planetsData.find(p => p.name === 'Earth');
    if (earthData) {
        var earthGeometry = new THREE.SphereGeometry(earthData.size, 32, 32);
        var earthMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('../textures/8k_earth_daymap.jpg'),
            shininess: 25
        });
        var earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.rotation.y = Math.PI;
        earth.rotation.z = 23.5 * Math.PI / 180; // Earth's axial tilt
        
        // Add cloud layer
        var cloudGeometry = new THREE.SphereGeometry(earthData.size + 0.2, 32, 32);
        var cloudMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('../textures/8k_earth_clouds.jpg'),
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        var clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        earth.add(clouds);
        
        // Add night lights
        var nightGeometry = new THREE.SphereGeometry(earthData.size + 0.05, 32, 32);
        var nightMaterial = new THREE.MeshBasicMaterial({
            map: textureLoader.load('../textures/8k_earth_nightmap.jpg'),
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        var nightSide = new THREE.Mesh(nightGeometry, nightMaterial);
        earth.add(nightSide);
        
        // Add hitbox for Earth
        const hitboxGeometry = new THREE.SphereGeometry(earthData.size * 2, 8, 8);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.userData = { ...earthData, isHitbox: true };
        earth.add(hitbox);
        
        earth.userData = {
            name: 'Earth',
            distance: 0,
            angle: 0,
            speed: 0, // Earth doesn't orbit in geocentric model
            rotationSpeed: 0.01 / (earthData.size * 0.4),
            originalSize: earthData.size,
            originalDistance: 0
        };
        
        earth.position.set(0, 0, 0); // Earth at center
        window.scene.add(earth);
        planets.push(earth);
        
        // Store Earth's original scale
        originalScales.push({
            name: 'Earth',
            size: earthData.size,
            distance: 0
        });
        
        originalPositions['Earth'] = {
            distance: 0,
            angle: 0
        };
        
        // Add the Moon orbiting Earth
        const moonSize = earthData.size * 0.27;
        const moonDistance = scaledGeocentricDistances['Moon'];
        const moonGeometry = new THREE.SphereGeometry(moonSize, 32, 32);
        const moonMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('../textures/8k_moon.jpg'),
            shininess: 5
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        
        // Create a separate moon object (not a child of Earth)
        moon.userData = {
            name: 'Moon',
            distance: moonDistance,
            angle: Math.random() * Math.PI * 2,
            speed: 0.06, // Moon moves fastest in the sky
            rotationSpeed: 0.01,
            description: "The Moon was the closest celestial body to Earth in the geocentric model, orbiting in the first sphere.",
            diameter: "Approximately 3,475 km",
            orbitalPeriod: "27.3 Earth days",
            dayLength: "27.3 Earth days (synchronous rotation)"
        };
        
        // Add hitbox for Moon
        const moonHitbox = new THREE.Mesh(
            new THREE.SphereGeometry(moonSize * 2, 8, 8),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        );
        moonHitbox.userData = { ...moon.userData, isHitbox: true };
        moon.add(moonHitbox);
        
        moon.position.set(moonDistance, 0, 0);
        window.scene.add(moon);
        planets.push(moon);
        
        originalScales.push({
            name: 'Moon',
            size: moonSize,
            distance: moonDistance
        });
        
        originalPositions['Moon'] = {
            distance: moonDistance,
            angle: moon.userData.angle
        };
        
        // Add Moon's orbit circle
        const moonOrbit = new THREE.Mesh(
            new THREE.RingGeometry(moonDistance - 0.2, moonDistance + 0.2, 64),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.15
            })
        );
        moonOrbit.rotation.x = Math.PI / 2;
        window.scene.add(moonOrbit);
    }
    
    // Add explicit orbit for the Sun around Earth
    const sunDistance = scaledGeocentricDistances['Sun'];
    const sunOrbit = new THREE.Mesh(
        new THREE.RingGeometry(sunDistance - 0.8, sunDistance + 0.8, 128),
        new THREE.MeshBasicMaterial({
            color: 0xffdd99, // Slightly different color for the Sun's orbit
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2 // More visible than other orbits
        })
    );
    sunOrbit.rotation.x = Math.PI / 2;
    window.scene.add(sunOrbit);
    
    // Initialize Sun position
    const sun = window.sun;
    if (sun) {
        sun.userData.angle = Math.PI/2; // Start at 90° position (12 o'clock)
        sun.userData.distance = sunDistance;
        sun.position.x = Math.cos(sun.userData.angle) * sunDistance;
        sun.position.z = Math.sin(sun.userData.angle) * sunDistance;
    }
    
    // Create a sunOrbitCenter object to hold all planet orbits
    // This will move with the sun, rotating all planetary orbits with it
    const sunOrbitCenter = new THREE.Object3D();
    sunOrbitCenter.position.copy(sun.position);
    window.scene.add(sunOrbitCenter);
    window.sunOrbitCenter = sunOrbitCenter;
    
    // Create other planets
    for (let i = 0; i < planetsData.length; i++) {
        const data = planetsData[i];
        if (data.name === 'Earth') continue; // Already created Earth
        
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        let material, planet;
        
        // Regular planet textures
        let texturePath;
        switch(data.name) {
            case 'Mercury': texturePath = '8k_mercury.jpg'; break;
            case 'Venus': texturePath = '8k_venus_surface.jpg'; break;
            case 'Mars': texturePath = '8k_mars.jpg'; break;
            case 'Jupiter': texturePath = '8k_jupiter.jpg'; break;
            case 'Saturn': texturePath = '8k_saturn.jpg'; break;
            default: texturePath = '8k_mercury.jpg';
        }
        
        material = new THREE.MeshPhongMaterial({
            map: textureLoader.load(`../textures/${texturePath}`),
            shininess: 25
        });
        
        planet = new THREE.Mesh(geometry, material);
        planet.rotation.y = Math.PI;
        
        // Add proper axial tilt
        switch(data.name) {
            case 'Mars': planet.rotation.z = 25.2 * Math.PI / 180; break;
            case 'Jupiter': planet.rotation.z = 3.1 * Math.PI / 180; break;
            case 'Saturn': planet.rotation.z = 26.7 * Math.PI / 180; break;
        }
        
        // Add Saturn's rings if needed
        if (data.name === 'Saturn') {
            const ringGeometry = new THREE.RingGeometry(data.size + 4, data.size + 12, 64);
            const ringTexture = textureLoader.load('../textures/8k_saturn_ring_alpha.png');
            const ringMaterial = new THREE.MeshBasicMaterial({
                map: ringTexture,
                transparent: true,
                side: THREE.DoubleSide
            });
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.rotation.x = Math.PI / 2;
            planet.add(rings);
        }
        
        // Add invisible hitbox for easier clicking
        const hitboxSize = data.size * 2;
        const hitboxGeometry = new THREE.SphereGeometry(hitboxSize, 8, 8);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.userData = { ...data, isHitbox: true };
        planet.add(hitbox);
        
        // Distance from Earth in the geocentric model
        const distance = scaledGeocentricDistances[data.name];
        
        planet.userData = {
            distance: distance,
            angle: Math.random() * Math.PI * 2,
            speed: data.speed,
            name: data.name,
            rotationSpeed: 0.01 / (data.size * 0.4),
            originalSize: data.size,
            originalDistance: distance,
            // For epicycles
            epicycleRadius: distance * 0.2,
            epicycleSpeed: data.speed * 5
        };
        
        // Store original values
        originalScales.push({
            name: data.name,
            size: data.size,
            distance: distance
        });
        
        originalPositions[data.name] = {
            distance: distance,
            angle: planet.userData.angle
        };
        
        // Position planet initially
        planet.position.set(distance, 0, 0);
        window.scene.add(planet);
        planets.push(planet);
        
        // For planets other than Moon, create orbits around Sun
        if (data.name !== 'Moon') {
            // Calculate the radius for this planet's orbit around Sun
            // This is smaller than Earth-centered distances
            const sunOrbitRadius = distance * 0.3; // Scale down orbit radius around Sun
            
            // Store this radius for animation
            planet.userData.sunOrbitRadius = sunOrbitRadius;
            
            // Create a visible orbital ring around the Sun for this planet
            const planetOrbit = new THREE.Mesh(
                new THREE.RingGeometry(sunOrbitRadius - 0.5, sunOrbitRadius + 0.5, 128),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.15
                })
            );
            planetOrbit.rotation.x = Math.PI / 2;
            
            // Add this orbit to the sunOrbitCenter so it moves with the Sun
            sunOrbitCenter.add(planetOrbit);
            
            // Store reference to orbit in planet data
            planet.userData.orbit = planetOrbit;
        }
    }
    
    // Create planet orbit trails that will follow the Sun
    planets.forEach(function(planet) {
        if (planet.userData.name === 'Earth' || planet.userData.name === 'Moon') return;
        
        // Create a dynamic orbit trail
        const orbitTrail = new THREE.Line(
            new THREE.BufferGeometry(),
            new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3
            })
        );
        
        // Add the trail to the scene and keep a reference
        window.scene.add(orbitTrail);
        planet.userData.orbitTrail = orbitTrail;
    });
}

// Update orbit lines to match current scale
function updateOrbitLines() {
    const scene = window.scene;
    if (!scene) return;
    
    // Track if we found the Sun's orbit
    let foundSunOrbit = false;
    
    scene.children.forEach(obj => {
        if (obj.type === 'Mesh' && obj.geometry.type === 'RingGeometry') {
            // Check if this is the Sun's orbit (Earth-centric)
            const isSunOrbit = obj.material.color.r > 0.8 && obj.material.color.g > 0.8;
            
            if (isSunOrbit) {
                // Update Sun's orbit around Earth
                foundSunOrbit = true;
                const sunDistance = scaledGeocentricDistances['Sun'];
                const newOrbit = new THREE.RingGeometry(sunDistance - 0.8, sunDistance + 0.8, 128);
                obj.geometry.dispose();
                obj.geometry = newOrbit;
                
                // Also update Sun's position to stay on its orbit
                const sun = window.sun;
                if (sun && sun.userData && sun.userData.angle !== undefined) {
                    sun.userData.distance = sunDistance;
                    sun.position.x = Math.cos(sun.userData.angle) * sunDistance;
                    sun.position.z = Math.sin(sun.userData.angle) * sunDistance;
                    
                    // Update the orbit center to follow Sun
                    if (window.sunOrbitCenter) {
                        window.sunOrbitCenter.position.copy(sun.position);
                    }
                }
                return;
            }
            
            // Handle Moon's orbit around Earth
            if (obj.geometry.parameters && 
                Math.abs(obj.geometry.parameters.innerRadius - (scaledGeocentricDistances['Moon'] - 0.2)) < 1) {
                // This is the Moon's orbit
                const moonDistance = scaledGeocentricDistances['Moon'];
                const newMoonOrbit = new THREE.RingGeometry(moonDistance - 0.2, moonDistance + 0.2, 64);
                obj.geometry.dispose();
                obj.geometry = newMoonOrbit;
                return;
            }
        }
    });
    
    // If we didn't find the Sun's orbit, create it
    if (!foundSunOrbit) {
        const sunDistance = scaledGeocentricDistances['Sun'];
        const sunOrbit = new THREE.Mesh(
            new THREE.RingGeometry(sunDistance - 0.8, sunDistance + 0.8, 128),
            new THREE.MeshBasicMaterial({
                color: 0xffdd99, // Distinct color for Sun's orbit
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.2
            })
        );
        sunOrbit.rotation.x = Math.PI / 2;
        scene.add(sunOrbit);
    }
    
    // Update all planetary orbits around the Sun
    if (window.sunOrbitCenter) {
        planets.forEach(function(planet) {
            const name = planet.userData.name;
            if (name === 'Earth' || name === 'Moon') return; // Skip Earth and Moon
            
            // Find this planet's orbit in the sunOrbitCenter
            const orbit = planet.userData.orbit;
            if (orbit) {
                // Update orbit size
                const sunOrbitRadius = planet.userData.distance * 0.3;
                planet.userData.sunOrbitRadius = sunOrbitRadius;
                
                // Create new geometry for updated orbit size
                const newOrbit = new THREE.RingGeometry(
                    sunOrbitRadius - 0.5, sunOrbitRadius + 0.5, 128
                );
                orbit.geometry.dispose();
                orbit.geometry = newOrbit;
            }
        });
    }
}

function updatePlanetScales(scaleMultiplier) {
    // Update geocentric distances based on scale
    updateGeocentricScales(scaleMultiplier);
    
    // Exact measurements where 1 unit = 1,000,000 km
    const exactSizes = {
        'Sun': 1.391, // diameter in units (millions of km)
        'Mercury': 0.00488,
        'Venus': 0.012104,
        'Earth': 0.012742,
        'Mars': 0.006779,
        'Jupiter': 0.13982,
        'Saturn': 0.11646,
        'Moon': 0.003474 // About 3,474 km
    };
    
    // Update the Sun's size first
    const sun = window.sun;
    if (sun) {
        const originalSunSize = 16; // Original sun size in the model
        let newSunSize;
        
        if (scaleMultiplier < 0.05) {
            // Visual mode
            newSunSize = originalSunSize;
        } else if (scaleMultiplier >= 0.95) {
            // True scale mode
            newSunSize = exactSizes['Sun'] * 50;
        } else {
            // Blended mode
            const sigmoid = 1 / (1 + Math.exp(-12 * (scaleMultiplier - 0.5)));
            newSunSize = originalSunSize * (1 - sigmoid) + exactSizes['Sun'] * 50 * sigmoid;
        }
        
        // Scale the sun
        sun.scale.set(newSunSize/originalSunSize, newSunSize/originalSunSize, newSunSize/originalSunSize);
        
        // Adjust glow effect
        if (sun.children.length > 0 && sun.children[0].type === 'Mesh') {
            const glowScale = 1.2 + 0.8 * scaleMultiplier;
            sun.children[0].scale.set(glowScale, glowScale, glowScale);
        }
        
        // Update sun's position in orbit
        const sunDistance = scaledGeocentricDistances['Sun'];
        if (sunDistance) {
            sun.userData.distance = sunDistance;
            
            // Position sun on its current angle
            const angle = sun.userData.angle || 0;
            sun.position.x = Math.cos(angle) * sunDistance;
            sun.position.z = Math.sin(angle) * sunDistance;
        }
    }
    
    // Now handle planets
    planets.forEach(function(planet) {
        const planetName = planet.userData.name;
        if (!planetName || !exactSizes[planetName]) return;
        
        const originalData = originalScales.find(p => p.name === planetName);
        if (!originalData) return;
        
        // Size scaling
        const baseSize = originalData.size;
        const exactSize = exactSizes[planetName];
        
        // Scale size based on mode
        let sizeScale;
        if (scaleMultiplier < 0.05) {
            // Nearly pure visual mode
            sizeScale = baseSize;
        } else if (scaleMultiplier >= 0.95) {
            // True scale mode
            const minSizeThreshold = 1; // Minimum visible size
            sizeScale = Math.max(exactSize * 50, minSizeThreshold);
        } else {
            // Blended mode
            const sigmoid = 1 / (1 + Math.exp(-12 * (scaleMultiplier - 0.5)));
            const visualComponentSize = baseSize * (1 - sigmoid);
            const trueComponentSize = exactSize * 50 * sigmoid;
            sizeScale = visualComponentSize + trueComponentSize;
        }
        
        // Apply size scaling
        planet.scale.set(sizeScale / baseSize, sizeScale / baseSize, sizeScale / baseSize);
        
        // Update planet's orbit and position
        if (planetName !== 'Earth') {
            // Get the scaled distance for this planet
            const orbitDistance = scaledGeocentricDistances[planetName];
            if (orbitDistance) {
                // Update userData for distance
                planet.userData.distance = orbitDistance;
                
                // Calculate epicycle radius with progressive reduction for outer planets
                // This prevents overlaps while maintaining the epicycle effect
                let epicycleRatio;
                if (planetName === 'Mercury') epicycleRatio = 0.25;
                else if (planetName === 'Venus') epicycleRatio = 0.2;
                else if (planetName === 'Mars') epicycleRatio = 0.15;
                else if (planetName === 'Jupiter') epicycleRatio = 0.1;
                else if (planetName === 'Saturn') epicycleRatio = 0.08;
                else epicycleRatio = 0.1; // Default for others
                
                // Calculate epicycle radius as a proportion of distance from Earth
                // but ensure it never causes overlap with adjacent orbits
                planet.userData.epicycleRadius = orbitDistance * epicycleRatio;
                
                // Update planet position based on current angle
                if (planetName === 'Moon') {
                    // Simple orbit for Moon
                    const angle = planet.userData.angle;
                    planet.position.x = Math.cos(angle) * orbitDistance;
                    planet.position.z = Math.sin(angle) * orbitDistance;
                } else {
                    // Complex orbit with epicycles for planets
                    const baseAngle = planet.userData.angle;
                    const epicycleAngle = planet.userData.angle * 5;
                    const epicycleRadius = planet.userData.epicycleRadius;
                    
                    // If it's Mercury or Venus, they move with the Sun
                    if (planetName === 'Mercury' || planetName === 'Venus') {
                        const sunAngle = sun.userData.angle || 0;
                        const sunDistance = sun.userData.distance;
                        
                        planet.position.x = Math.cos(sunAngle) * sunDistance + 
                                           Math.cos(epicycleAngle) * epicycleRadius;
                        planet.position.z = Math.sin(sunAngle) * sunDistance + 
                                           Math.sin(epicycleAngle) * epicycleRadius;
                    } else {
                        // Other planets have their own orbits with epicycles
                        planet.position.x = Math.cos(baseAngle) * orbitDistance + 
                                           Math.cos(epicycleAngle) * epicycleRadius;
                        planet.position.z = Math.sin(baseAngle) * orbitDistance + 
                                           Math.sin(epicycleAngle) * epicycleRadius;
                    }
                }
            }
        }
    });
}

// Function to reset planet positions
function resetPlanetPositions() {
    // Reset sun position with proper orbit
    const sun = window.sun;
    if (sun) {
        // Start sun at 12 o'clock position
        sun.userData.angle = Math.PI/2;
        const distance = scaledGeocentricDistances['Sun'];
        sun.userData.distance = distance;
        sun.position.x = Math.cos(sun.userData.angle) * distance;
        sun.position.z = Math.sin(sun.userData.angle) * distance;
        
        // Update orbit center position
        if (window.sunOrbitCenter) {
            window.sunOrbitCenter.position.copy(sun.position);
        }
    }
    
    // Reset planets with specific placements for visual clarity
    planets.forEach(function(planet) {
        const name = planet.userData.name;
        
        if (name === 'Earth') {
            // Earth stays at center
            planet.position.set(0, 0, 0);
        } else if (name === 'Moon') {
            // Moon orbits Earth directly
            const initialAngle = 0; // 3 o'clock position
            const distance = scaledGeocentricDistances[name];
            
            planet.userData.angle = initialAngle;
            planet.position.x = Math.cos(initialAngle) * distance;
            planet.position.z = Math.sin(initialAngle) * distance;
            planet.userData.distance = distance;
        } else {
            // Distribute planets evenly around Sun
            let initialAngle;
            // Calculate orbit radius around Sun
            const orbitRadius = planet.userData.distance * 0.3;
            planet.userData.sunOrbitRadius = orbitRadius;
            
            // Position planets at different angles around the Sun
            switch(name) {
                case 'Mercury': initialAngle = 0; break; // 0° relative to Sun
                case 'Venus': initialAngle = Math.PI/3; break; // 60° relative to Sun
                case 'Mars': initialAngle = 2*Math.PI/3; break; // 120° relative to Sun
                case 'Jupiter': initialAngle = Math.PI; break; // 180° relative to Sun 
                case 'Saturn': initialAngle = 4*Math.PI/3; break; // 240° relative to Sun
                default: initialAngle = Math.random() * Math.PI * 2;
            }
            
            planet.userData.angle = initialAngle;
            
            // Calculate position relative to Sun
            const sunX = sun.position.x;
            const sunZ = sun.position.z;
            
            // Position planet in orbit around the Sun
            planet.position.x = sunX + Math.cos(initialAngle) * orbitRadius;
            planet.position.z = sunZ + Math.sin(initialAngle) * orbitRadius;
        }
    });
    
    // Update orbit lines to match current scale
    updateOrbitLines();
}

function updatePlanets(speedMultiplier = 1) {
    // Earth stays at center, but rotates
    const earth = planets.find(p => p.userData.name === 'Earth');
    if (earth) {
        earth.rotation.y += earth.userData.rotationSpeed * speedMultiplier;
    }
    
    // Update sun position - it orbits Earth
    const sun = window.sun;
    if (sun) {
        // Sun moves slower in geocentric model
        sun.userData.angle = (sun.userData.angle || 0) + 0.005 * speedMultiplier;
        const sunDistance = scaledGeocentricDistances['Sun'];
        
        // Position Sun in orbit around Earth
        sun.position.x = Math.cos(sun.userData.angle) * sunDistance;
        sun.position.z = Math.sin(sun.userData.angle) * sunDistance;
        
        // Sun self-rotation
        sun.rotation.y += 0.004 * speedMultiplier;
        
        // Update light source position
        if (window.sunLight) {
            window.sunLight.position.copy(sun.position);
        }
        
        // Update the sun orbit center position to follow the Sun
        if (window.sunOrbitCenter) {
            window.sunOrbitCenter.position.copy(sun.position);
        }
    }
    
    // Update other planets
    planets.forEach(function(planet) {
        const name = planet.userData.name;
        if (name === 'Earth') return; // Earth stays at center
        
        // Update angle
        planet.userData.angle += planet.userData.speed * speedMultiplier;
        
        if (name === 'Moon') {
            // Moon orbits Earth directly
            const distance = planet.userData.distance;
            planet.position.x = Math.cos(planet.userData.angle) * distance;
            planet.position.z = Math.sin(planet.userData.angle) * distance;
        } else {
            // All other planets orbit the Sun (which orbits Earth)
            // The Sun's position becomes the center of planetary orbits
            const sunX = sun.position.x;
            const sunZ = sun.position.z;
            
            // Get the planet's orbit radius around the Sun
            const orbitRadius = planet.userData.sunOrbitRadius;
            
            // Position planet in orbit around the Sun (not Earth)
            planet.position.x = sunX + Math.cos(planet.userData.angle) * orbitRadius;
            planet.position.z = sunZ + Math.sin(planet.userData.angle) * orbitRadius;
        }
        
        // Planet self-rotation
        planet.rotation.y += planet.userData.rotationSpeed * speedMultiplier;
    });
}

// Make functions available to other scripts
window.updatePlanetScales = updatePlanetScales;
window.updatePlanets = updatePlanets;
window.resetPlanetPositions = resetPlanetPositions;

// Initialize when the page loads
window.addEventListener('load', function() {
    createPlanets();
    
    // Apply initial scale
    if (window.scaleMultiplier !== undefined) {
        updatePlanetScales(window.scaleMultiplier);
    }
});
