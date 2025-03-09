var planets = [];
var planetsData = [
    { 
        name: 'Mercury', 
        distance: 28, 
        size: 3, 
        speed: 0.04, 
        color: 0x808080,
        description: 'First planet from the Sun. Mercury is the smallest planet in the Solar System and has a very thin atmosphere.',
        diameter: 'Approximately 4,880 km',
        orbitalPeriod: 'About 88 Earth days',
        dayLength: 'Roughly 58 Earth days (rotation period)'
    },
    { 
        name: 'Venus', 
        distance: 44, 
        size: 5.8, 
        speed: 0.015, 
        color: 0xffd700,
        description: 'Second planet from the Sun. It has the densest atmosphere of all rocky planets and is the hottest despite being farther from the Sun than Mercury.',
        diameter: 'Approximately 12,104 km',
        orbitalPeriod: 'About 225 Earth days',
        dayLength: 'Around 243 Earth days (retrograde rotation)'
    },
    { 
        name: 'Earth', 
        distance: 62, 
        size: 6, 
        speed: 0.01, 
        color: 0x4169e1,
        description: 'Third planet from the Sun. The only planet known to harbor life, with diverse ecosystems and abundant liquid water.',
        diameter: 'Approximately 12,742 km',
        orbitalPeriod: 'About 365.25 days',
        dayLength: '24 hours'
    },
    { 
        name: 'Mars', 
        distance: 78, 
        size: 4, 
        speed: 0.008, 
        color: 0xff4500,
        description: 'Fourth planet from the Sun. Known as the Red Planet due to its iron oxide-rich surface; it has a thin atmosphere and features like valleys and volcanoes.',
        diameter: 'Approximately 6,779 km',
        orbitalPeriod: 'About 687 Earth days',
        dayLength: 'Approximately 24.6 hours'
    },
    { 
        name: 'Jupiter', 
        distance: 100, 
        size: 15, 
        speed: 0.002, 
        color: 0xffa500,
        description: 'Fifth planet from the Sun. The largest planet in the Solar System, famous for its Great Red Spot and strong magnetic field.',
        diameter: 'Approximately 139,820 km',
        orbitalPeriod: 'About 12 Earth years',
        dayLength: 'Roughly 9.9 hours'
    },
    { 
        name: 'Saturn', 
        distance: 138, 
        size: 12, 
        speed: 0.001, 
        color: 0xffd700,
        description: 'Sixth planet from the Sun. Known for its spectacular ring system and numerous moons.',
        diameter: 'Approximately 116,460 km',
        orbitalPeriod: 'About 29.5 Earth years',
        dayLength: 'Around 10.7 hours'
    },
    { 
        name: 'Uranus', 
        distance: 176, 
        size: 8, 
        speed: 0.0007, 
        color: 0x40e0d0,
        description: 'Seventh planet from the Sun. Notable for its unique axial tilt where it rotates on its side and its blue-green color owing to methane in its atmosphere.',
        diameter: 'Approximately 50,724 km',
        orbitalPeriod: 'About 84 Earth years',
        dayLength: 'Roughly 17.2 hours'
    },
    { 
        name: 'Neptune', 
        distance: 200, 
        size: 7.8, 
        speed: 0.0005, 
        color: 0x4169e1,
        description: 'Eighth planet from the Sun. Known for its deep blue color and strong supersonic winds in its atmosphere.',
        diameter: 'Approximately 49,244 km',
        orbitalPeriod: 'About 164.8 Earth years',
        dayLength: 'Approximately 16.1 hours'
    }
];

// Original planet sizes and distances for scale reference
var originalScales = [];

function createPlanets() {
    var textureLoader = new THREE.TextureLoader();
    
    planetsData.forEach(function(data) {
        var geometry = new THREE.SphereGeometry(data.size, 32, 32);
        var material;
        var planet;

        if (data.name === 'Earth') {
            // Special handling for Earth with daymap texture
            material = new THREE.MeshPhongMaterial({ 
                map: textureLoader.load('textures/8k_earth_daymap.jpg'),
                shininess: 25
            });
            planet = new THREE.Mesh(geometry, material);
            planet.rotation.y = Math.PI;

            // Add cloud layer
            var cloudGeometry = new THREE.SphereGeometry(data.size + 0.2, 32, 32);
            var cloudMaterial = new THREE.MeshPhongMaterial({
                map: textureLoader.load('textures/8k_earth_clouds.jpg'),
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            var clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
            planet.add(clouds);
            
            // Add night lights
            var nightGeometry = new THREE.SphereGeometry(data.size + 0.05, 32, 32);
            var nightMaterial = new THREE.MeshBasicMaterial({
                map: textureLoader.load('textures/8k_earth_nightmap.jpg'),
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            var nightSide = new THREE.Mesh(nightGeometry, nightMaterial);
            planet.add(nightSide);
        } else {
            // Regular planet textures
            let texturePath;
            switch(data.name) {
                case 'Mercury': texturePath = '8k_mercury.jpg'; break;
                case 'Venus': texturePath = '8k_venus_surface.jpg'; break;
                case 'Mars': texturePath = '8k_mars.jpg'; break;
                case 'Jupiter': texturePath = '8k_jupiter.jpg'; break;
                case 'Saturn': texturePath = '8k_saturn.jpg'; break;
                case 'Uranus': texturePath = '2k_uranus.jpg'; break;
                case 'Neptune': texturePath = '2k_neptune.jpg'; break;
                default: texturePath = '8k_mercury.jpg';
            }

            material = new THREE.MeshPhongMaterial({ 
                map: textureLoader.load(`textures/${texturePath}`),
                shininess: 25
            });
            planet = new THREE.Mesh(geometry, material);
            planet.rotation.y = Math.PI;

            // Add Saturn's rings
            if (data.name === 'Saturn') {
                const ringGeometry = new THREE.RingGeometry(data.size + 4, data.size + 12, 64);
                const ringTexture = textureLoader.load('textures/8k_saturn_ring_alpha.png');
                const ringMaterial = new THREE.MeshBasicMaterial({
                    map: ringTexture,
                    transparent: true,
                    side: THREE.DoubleSide
                });
                const rings = new THREE.Mesh(ringGeometry, ringMaterial);
                rings.rotation.x = Math.PI / 2;
                planet.add(rings);
            }
        }

        // Add invisible hitbox for easier clicking
        const hitboxSize = data.size * 2; // Hitbox twice the size of the planet
        const hitboxGeometry = new THREE.SphereGeometry(hitboxSize, 8, 8);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0, // Completely invisible
            depthWrite: false // Don't write to depth buffer
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.userData = { ...data, isHitbox: true }; // Copy all planet data to hitbox
        
        planet.add(hitbox); // Add hitbox as child of planet so it moves with it

        planet.userData = { 
            distance: data.distance, 
            angle: Math.random() * Math.PI * 2, 
            speed: data.speed, 
            name: data.name,
            originalSize: data.size,
            originalDistance: data.distance,
            rotationSpeed: 0.01 / (data.size * 0.4) // Smaller planets rotate faster
        };
        
        // Store original values for scaling
        originalScales.push({
            name: data.name,
            size: data.size,
            distance: data.distance
        });
        
        // Set proper axial tilt for planets
        switch(data.name) {
            case 'Earth':
                planet.rotation.z = 23.5 * Math.PI / 180; // Earth's axial tilt
                break;
            case 'Mars':
                planet.rotation.z = 25.2 * Math.PI / 180;
                break;
            case 'Jupiter':
                planet.rotation.z = 3.1 * Math.PI / 180;
                break;
            case 'Saturn':
                planet.rotation.z = 26.7 * Math.PI / 180;
                break;
            case 'Uranus':
                planet.rotation.z = 97.8 * Math.PI / 180; // Uranus has an extreme tilt
                break;
            case 'Neptune':
                planet.rotation.z = 28.3 * Math.PI / 180;
                break;
        }

        planet.position.set(data.distance, 0, 0);
        window.scene.add(planet);
        planets.push(planet);

        var orbitGeometry = new THREE.RingGeometry(data.distance - 0.5, data.distance + 0.5, 128);
        var orbitMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.15
        });
        var orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        window.scene.add(orbit);
        
        // Add Moon for Earth
        if (data.name === 'Earth') {
            const moonSize = data.size * 0.27; // Moon is about 27% of Earth's size
            const moonDistance = data.size * 2.5; // Distance from Earth
            const moonGeometry = new THREE.SphereGeometry(moonSize, 32, 32);
            const moonMaterial = new THREE.MeshPhongMaterial({
                map: textureLoader.load('textures/8k_moon.jpg'),
                shininess: 5
            });
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            
            // Create a pivot point
            const moonPivot = new THREE.Object3D();
            planet.add(moonPivot);
            
            // Add moon to pivot and position it
            moonPivot.add(moon);
            moon.position.set(moonDistance, 0, 0);
            
            // Add moon data for info panel
            moon.userData = {
                name: "Moon",
                description: "Earth's only natural satellite. The fifth largest satellite in the Solar System.",
                diameter: "Approximately 3,475 km",
                orbitalPeriod: "27.3 Earth days",
                dayLength: "29.5 Earth days (synchronized rotation)"
            };
            
            // Add hitbox for the moon
            const moonHitboxGeometry = new THREE.SphereGeometry(moonSize * 2, 8, 8);
            const moonHitboxMaterial = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                depthWrite: false
            });
            const moonHitbox = new THREE.Mesh(moonHitboxGeometry, moonHitboxMaterial);
            moonHitbox.userData = { ...moon.userData, isHitbox: true };
            moon.add(moonHitbox);
            
            // Store moon data for animation
            moon.userData.angle = 0;
            moon.userData.speed = 0.03;
            moon.userData.pivotPoint = moonPivot;
        }
    });
}

function updatePlanetScales(scaleMultiplier) {
    // Default value if not provided
    scaleMultiplier = scaleMultiplier || window.scaleMultiplier || 0.2;
    
    // Exact measurements where 1 unit = 1,000,000 km
    const exactSizes = {
        'Sun': 1.391, // diameter in units (millions of km)
        'Mercury': 0.00488,
        'Venus': 0.012104,
        'Earth': 0.012742,
        'Mars': 0.006779,
        'Jupiter': 0.13982,
        'Saturn': 0.11646,
        'Uranus': 0.050724,
        'Neptune': 0.049244,
        'Moon': 0.003474 // About 3,474 km
    };
    
    // Exact orbital distances in units (millions of km)
    const exactDistances = {
        'Mercury': 57.9,
        'Venus': 108.2,
        'Earth': 149.6,
        'Mars': 227.9,
        'Jupiter': 778.5,
        'Saturn': 1433.5,
        'Uranus': 2872.5,
        'Neptune': 4495.0
    };
    
    // Base visual properties for reference
    const baseVisualDistances = {
        'Mercury': 28,
        'Venus': 44,
        'Earth': 62,
        'Mars': 78,
        'Jupiter': 100,
        'Saturn': 138,
        'Uranus': 176,
        'Neptune': 200
    };

    // Scale factor for visualization - this determines how much we compress the real scale
    // to make it viewable while maintaining proper relationships
    const visualScaleFactor = 0.5; // Decrease to compress more, increase to expand
    
    // Define a spacing multiplier that increases separation between planets in semi-realistic mode
    // This will be strongest at scaleMultiplier = 0.5 (semi-realistic)
    const semiRealisticSpacingFactor = Math.sin(Math.PI * scaleMultiplier) * 1.8 + 1;
    
    // Reduced Sun size factor specifically for semi-realistic mode to prevent Mercury overlap
    const sunSizeReductionFactor = scaleMultiplier < 0.2 ? 1 : 
                                  (scaleMultiplier > 0.8 ? 1 : 
                                   1 - 0.4 * Math.sin(Math.PI * (scaleMultiplier - 0.2) / 0.6));
    
    // Update the Sun's size first
    const sun = window.sun;
    if (sun) {
        const originalSunSize = 16; // Original sun size in the model
        let newSunSize;
        
        if (scaleMultiplier < 0.05) {
            // Visual mode
            newSunSize = originalSunSize;
        } else if (scaleMultiplier >= 0.95) {
            // True scale mode - apply exact measurements
            // For true scale, make sun visible but still in proportion
            newSunSize = exactSizes['Sun'] * 50;
        } else {
            // Blended mode
            const sigmoid = 1 / (1 + Math.exp(-12 * (scaleMultiplier - 0.5)));
            newSunSize = originalSunSize * (1 - sigmoid) + exactSizes['Sun'] * 50 * sigmoid;
            
            // Apply size reduction in semi-realistic mode
            newSunSize *= sunSizeReductionFactor;
        }
        
        // Scale the sun
        sun.scale.set(newSunSize/originalSunSize, newSunSize/originalSunSize, newSunSize/originalSunSize);
        
        // Adjust the glow effect
        if (sun.children.length > 0 && sun.children[0].type === 'Mesh') {
            const glowScale = 1.2 + 0.8 * scaleMultiplier;
            sun.children[0].scale.set(glowScale, glowScale, glowScale);
        }
    }
    
    // Now handle planets with knowledge of the sun's new size
    planets.forEach(function(planet) {
        const planetName = planet.userData.name;
        if (!planetName || !exactSizes[planetName]) return;
        
        const originalData = originalScales.find(p => p.name === planetName);
        if (!originalData) return;
        
        // Size scaling
        const baseSize = originalData.size;
        const exactSize = exactSizes[planetName];
        
        // For sizes, we need an exponential curve to handle the vast differences
        // Apply minimum size threshold for visibility in true scale
        let sizeScale;
        if (scaleMultiplier < 0.05) {
            // Nearly pure visual mode
            sizeScale = baseSize;
        } else if (scaleMultiplier >= 0.95) {
            // Nearly pure true scale mode - apply exact measurements
            // Use visual scale factor to make objects visible, but maintain proper relationships
            const minSizeThreshold = 1; // Minimum visible size
            sizeScale = Math.max(exactSize * 50, minSizeThreshold);
        } else {
            // Blended mode - mix visual appeal with accuracy
            // Use a sigmoid function to smooth transition between modes
            const sigmoid = 1 / (1 + Math.exp(-12 * (scaleMultiplier - 0.5)));
            const visualComponentSize = baseSize * (1 - sigmoid);
            const trueComponentSize = exactSize * 50 * sigmoid;
            sizeScale = visualComponentSize + trueComponentSize;
        }
        
        // Apply size scaling
        planet.scale.set(sizeScale / baseSize, sizeScale / baseSize, sizeScale / baseSize);
        
        // Distance scaling
        if (planetName !== 'Sun') {
            const orbitIndex = Array.from(window.scene.children).findIndex(obj => 
                obj.type === 'Mesh' && 
                obj.geometry.type === 'RingGeometry' &&
                Math.abs(obj.geometry.parameters.innerRadius - (originalData.distance - 0.5)) < 0.1
            );
            
            if (orbitIndex !== -1) {
                // Calculate orbit distance
                let orbitDistance;
                
                if (scaleMultiplier < 0.05) {
                    // Nearly pure visual mode
                    orbitDistance = baseVisualDistances[planetName];
                } else if (scaleMultiplier >= 0.95) {
                    // Pure true scale mode - apply exact measurements
                    // For true scale, apply log compression for outer planets to keep viewable
                    if (exactDistances[planetName] > 300) {
                        const base = Math.log(300); // Base logarithm at Mars
                        orbitDistance = 227.9 + (Math.log(exactDistances[planetName]) - base) * visualScaleFactor * 60;
                    } else {
                        orbitDistance = exactDistances[planetName] * visualScaleFactor;
                    }
                } else {
                    // Blended mode - mix visual appeal with accuracy
                    const sigmoid = 1 / (1 + Math.exp(-12 * (scaleMultiplier - 0.5)));
                    
                    let trueDistance;
                    if (exactDistances[planetName] > 300) {
                        const base = Math.log(300); // Base logarithm at Mars
                        trueDistance = 227.9 + (Math.log(exactDistances[planetName]) - base) * visualScaleFactor * 60;
                    } else {
                        trueDistance = exactDistances[planetName] * visualScaleFactor;
                    }
                    
                    // Base orbit distance from visual to realistic
                    orbitDistance = baseVisualDistances[planetName] * (1 - sigmoid) + trueDistance * sigmoid;
                    
                    // Apply additional spacing in semi-realistic mode
                    // Mercury gets extra spacing to avoid sun overlap
                    if (planetName === 'Mercury') {
                        orbitDistance *= 1 + (semiRealisticSpacingFactor - 1) * 1.5;
                    } else {
                        // Progressive spacing increase for outer planets
                        const planetIndex = ['Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].indexOf(planetName);
                        if (planetIndex >= 0) {
                            // Increase spacing progressively for outer planets
                            const progressiveFactor = 1 + (planetIndex / 10);
                            orbitDistance *= semiRealisticSpacingFactor * progressiveFactor;
                        }
                    }
                }
                
                // Create new orbit with updated size
                const newOrbit = new THREE.RingGeometry(orbitDistance - 0.5, orbitDistance + 0.5, 128);
                window.scene.children[orbitIndex].geometry.dispose();
                window.scene.children[orbitIndex].geometry = newOrbit;
                
                // Update planet's distance property for orbital calculations
                planet.userData.distance = orbitDistance;
                
                // Ensure the planet is positioned at the new orbit distance
                const angle = planet.userData.angle;
                planet.position.x = Math.cos(angle) * orbitDistance;
                planet.position.z = Math.sin(angle) * orbitDistance;
                
                // Update Earth's moon if needed
                if (planetName === 'Earth') {
                    planet.children.forEach(child => {
                        if (child.type === 'Object3D' && child.children.length > 0) {
                            const possibleMoon = child.children[0];
                            if (possibleMoon.userData && possibleMoon.userData.name === 'Moon') {
                                // Moon distance from Earth is about 0.3844 million km
                                const moonDistance = scaleMultiplier >= 0.95 ? 
                                    0.3844 * visualScaleFactor * 10 : // True scale but amplified to be visible
                                    sizeScale * 2.5; // Visual mode keeps moon close enough to see
                                possibleMoon.position.set(moonDistance, 0, 0);
                            }
                        }
                    });
                }
            }
        }
    });
}
window.updatePlanetScales = updatePlanetScales;

function updatePlanets(speedMultiplier = 1) {
    planets.forEach(function(planet) {
        // Orbital movement
        planet.userData.angle += planet.userData.speed * speedMultiplier;
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
        
        // Self rotation
        planet.rotation.y += planet.userData.rotationSpeed * speedMultiplier;
        
        // Update Earth's moon
        if (planet.userData.name === 'Earth') {
            planet.children.forEach(child => {
                // Check if this child has any meshes that could be the moon
                child.children.forEach(subChild => {
                    if (subChild.userData && subChild.userData.name === 'Moon') {
                        child.rotation.y += 0.03 * speedMultiplier; // Moon orbiting around Earth
                        subChild.rotation.y += 0.01 * speedMultiplier; // Moon rotation
                    }
                });
            });
        }
    });
}
window.updatePlanets = updatePlanets;
window.addEventListener('load', function() {
    createPlanets();
    // Apply initial scale
    if (window.scaleMultiplier !== undefined) {
        updatePlanetScales(window.scaleMultiplier);
    }
});
