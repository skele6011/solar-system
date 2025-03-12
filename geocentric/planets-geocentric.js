var celestialBodies = [];
var earth; // Reference to Earth
var sun; // Reference to Sun
var originalGeoScales = [];
var originalPositions = {};

// Geocentric data - Earth at center with historical properties
var celestialData = [
    { 
        name: 'Earth', 
        size: 6, 
        isCenter: true, 
        color: 0x4169e1,
        description: 'In the Ptolemaic system, Earth is the stationary center of the universe. All celestial bodies orbit around it.',
        diameter: 'Approximately 12,742 km',
        orbitalPeriod: 'Stationary - center of the universe',
        dayLength: '24 hours'
    },
    { 
        name: 'Moon', 
        distance: 15, 
        size: 1.6, 
        speed: 0.03, 
        color: 0xCCCCCC,
        description: 'Earth\'s only natural satellite. In the geocentric model, it is the closest celestial body orbiting Earth.',
        diameter: 'Approximately 3,475 km',
        orbitalPeriod: 'About 27.3 Earth days',
        dayLength: '29.5 Earth days (synchronized rotation)'
    },
    { 
        name: 'Mercury', 
        distance: 50, 
        size: 3, 
        speed: 0.015, 
        epicycleRadius: 10,
        epicycleSpeed: 0.08,
        color: 0x808080,
        description: 'In the Ptolemaic system, Mercury moves on a small epicycle, which in turn moves around a larger deferent centered on Earth.',
        diameter: 'Approximately 4,880 km',
        orbitalPeriod: 'About 88 Earth days',
        dayLength: 'Roughly 58 Earth days (rotation period)'
    },
    { 
        name: 'Venus', 
        distance: 70, 
        size: 5.8, 
        speed: 0.01, 
        epicycleRadius: 15,
        epicycleSpeed: 0.06,
        color: 0xffd700,
        description: 'Second planet from the Sun in reality, but in the geocentric model, Venus orbits between the Sun and Mars.',
        diameter: 'Approximately 12,104 km',
        orbitalPeriod: 'About 225 Earth days',
        dayLength: 'Around 243 Earth days (retrograde rotation)'
    },
    { 
        name: 'Sun', 
        distance: 100, 
        size: 16, 
        speed: 0.008,
        epicycleRadius: 0, // Sun doesn't use epicycles in Ptolemaic model
        epicycleSpeed: 0,
        color: 0xffdd00,
        description: 'In the geocentric model, the Sun orbits around Earth. The Ptolemaic system placed it between Venus and Mars.',
        diameter: 'Approximately 1,392,700 km (109 times Earth\'s diameter)',
        orbitalPeriod: 'About 365.25 Earth days in the geocentric model',
        dayLength: 'Approximately 27 Earth days'
    },
    { 
        name: 'Mars', 
        distance: 150, 
        size: 4, 
        speed: 0.006, 
        epicycleRadius: 20,
        epicycleSpeed: 0.04,
        color: 0xff4500,
        description: 'In the geocentric system, Mars orbits beyond the Sun, exhibiting complex retrograde motion that was explained with epicycles.',
        diameter: 'Approximately 6,779 km',
        orbitalPeriod: 'About 687 Earth days',
        dayLength: 'Approximately 24.6 hours'
    },
    { 
        name: 'Jupiter', 
        distance: 200, 
        size: 15, 
        speed: 0.004, 
        epicycleRadius: 25,
        epicycleSpeed: 0.03,
        color: 0xffa500,
        description: 'Known to ancient astronomers, Jupiter was considered a wandering star in the geocentric model, orbiting Earth beyond Mars.',
        diameter: 'Approximately 139,820 km',
        orbitalPeriod: 'About 12 Earth years',
        dayLength: 'Roughly 9.9 hours'
    },
    { 
        name: 'Saturn', 
        distance: 250, 
        size: 12, 
        speed: 0.002, 
        epicycleRadius: 30,
        epicycleSpeed: 0.02,
        color: 0xffd700,
        description: 'The outermost planet known to ancient astronomers. In the Ptolemaic system, it was the slowest moving celestial body.',
        diameter: 'Approximately 116,460 km',
        orbitalPeriod: 'About 29.5 Earth years',
        dayLength: 'Around 10.7 hours'
    }
];

function createGeocentricSystem() {
    var textureLoader = new THREE.TextureLoader();
    
    celestialData.forEach(function(data) {
        var geometry = new THREE.SphereGeometry(data.size, 32, 32);
        var material;
        var celestialBody;
        
        // Special cases for Earth and texture mapping
        if (data.name === 'Earth') {
            material = new THREE.MeshPhongMaterial({ 
                map: textureLoader.load('../textures/8k_earth_daymap.jpg'),
                shininess: 25
            });
            celestialBody = new THREE.Mesh(geometry, material);
            celestialBody.rotation.y = Math.PI;

            // Add cloud layer
            var cloudGeometry = new THREE.SphereGeometry(data.size + 0.2, 32, 32);
            var cloudMaterial = new THREE.MeshPhongMaterial({
                map: textureLoader.load('../textures/8k_earth_clouds.jpg'),
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            var clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
            celestialBody.add(clouds);
            
            // Add night lights
            var nightGeometry = new THREE.SphereGeometry(data.size + 0.05, 32, 32);
            var nightMaterial = new THREE.MeshBasicMaterial({
                map: textureLoader.load('../textures/8k_earth_nightmap.jpg'),
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            var nightSide = new THREE.Mesh(nightGeometry, nightMaterial);
            celestialBody.add(nightSide);
            
            // Store Earth reference
            earth = celestialBody;
        } 
        else if (data.name === 'Sun') {
            material = new THREE.MeshBasicMaterial({ 
                map: textureLoader.load('../textures/8k_sun.jpg')
            });
            celestialBody = new THREE.Mesh(geometry, material);
            
            // Add sun glow
            var sunGlowGeometry = new THREE.SphereGeometry(data.size * 1.2, 32, 32);
            var sunGlowMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    c: { type: "f", value: 0.5 },
                    p: { type: "f", value: 6.0 },
                    glowColor: { type: "c", value: new THREE.Color(0xffddaa) },
                    viewVector: { type: "v3", value: window.camera.position }
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
            celestialBody.add(sunGlow);
            
            // Store Sun reference
            sun = celestialBody;
            
            // Connect sun light to sun position
            if (window.sunLight) {
                celestialBody.add(window.sunLight);
                window.sunLight.position.set(0, 0, 0);
            }
        } 
        else {
            // Regular planet textures
            let texturePath;
            switch(data.name) {
                case 'Mercury': texturePath = '8k_mercury.jpg'; break;
                case 'Venus': texturePath = '8k_venus_surface.jpg'; break;
                case 'Mars': texturePath = '8k_mars.jpg'; break;
                case 'Jupiter': texturePath = '8k_jupiter.jpg'; break;
                case 'Saturn': texturePath = '8k_saturn.jpg'; break;
                case 'Moon': texturePath = '8k_moon.jpg'; break;
                default: texturePath = '8k_mercury.jpg';
            }

            material = new THREE.MeshPhongMaterial({ 
                map: textureLoader.load(`../textures/${texturePath}`),
                shininess: 25
            });
            celestialBody = new THREE.Mesh(geometry, material);
            celestialBody.rotation.y = Math.PI;

            // Add Saturn's rings
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
                celestialBody.add(rings);
            }
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
        
        celestialBody.add(hitbox);
        
        // Store celestial body data
        celestialBody.userData = { 
            name: data.name,
            distance: data.distance,
            speed: data.speed,
            angle: Math.random() * Math.PI * 2,
            epicycleRadius: data.epicycleRadius || 0,
            epicycleSpeed: data.epicycleSpeed || 0,
            epicycleAngle: Math.random() * Math.PI * 2,
            rotationSpeed: 0.01 / (data.size * 0.4),
            originalSize: data.size,
            originalDistance: data.distance,
            originalEpicycleRadius: data.epicycleRadius || 0,
            isCenter: data.isCenter || false
        };
        
        // Store original values for scaling
        originalGeoScales.push({
            name: data.name,
            size: data.size,
            distance: data.distance,
            epicycleRadius: data.epicycleRadius || 0
        });
        
        // Store initial position for this celestial body
        originalPositions[data.name] = {
            distance: data.distance,
            angle: celestialBody.userData.angle,
            epicycleRadius: data.epicycleRadius || 0,
            epicycleAngle: celestialBody.userData.epicycleAngle
        };
        
        // Set axial tilts
        switch(data.name) {
            case 'Earth':
                celestialBody.rotation.z = 23.5 * Math.PI / 180;
                break;
            case 'Mars':
                celestialBody.rotation.z = 25.2 * Math.PI / 180;
                break;
            case 'Jupiter':
                celestialBody.rotation.z = 3.1 * Math.PI / 180;
                break;
            case 'Saturn':
                celestialBody.rotation.z = 26.7 * Math.PI / 180;
                break;
        }

        // Position the celestial body
        if (data.isCenter) {
            celestialBody.position.set(0, 0, 0);
        } else {
            // Initial position on their orbit
            const angle = celestialBody.userData.angle;
            celestialBody.position.set(
                Math.cos(angle) * data.distance, 
                0, 
                Math.sin(angle) * data.distance
            );
        }
        
        window.scene.add(celestialBody);
        celestialBodies.push(celestialBody);

        // Create orbit visualization if not Earth
        if (!data.isCenter) {
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
            
            // Create epicycle visualization for planets (not for Sun and Moon)
            if (data.epicycleRadius && data.epicycleRadius > 0 && data.name !== 'Moon') {
                var epicycleGeometry = new THREE.RingGeometry(
                    data.epicycleRadius - 0.3, 
                    data.epicycleRadius + 0.3, 
                    64
                );
                var epicycleMaterial = new THREE.MeshBasicMaterial({
                    color: 0xCCCCCC,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.1
                });
                var epicycle = new THREE.Mesh(epicycleGeometry, epicycleMaterial);
                epicycle.rotation.x = Math.PI / 2;
                
                // Store reference to epicycle for updating
                celestialBody.userData.epicycle = epicycle;
                
                // Position epicycle at orbit position - FIX: use celestialBody.userData.angle instead of undefined angle
                epicycle.position.set(
                    Math.cos(celestialBody.userData.angle) * data.distance, 
                    0, 
                    Math.sin(celestialBody.userData.angle) * data.distance
                );
                
                window.scene.add(epicycle);
            }
        }
    });
}

function updateGeocentricPlanets(speedMultiplier) {
    // Use the provided parameter or fall back to window value
    const speed = speedMultiplier !== undefined ? speedMultiplier : (window.speedMultiplier || 1.0);
    
    // Update each celestial body position and rotation
    celestialBodies.forEach(function(body) {
        if (!body.userData.isCenter) {
            // Update orbit angle
            body.userData.angle += body.userData.speed * speed;
            
            // Calculate main orbit position
            const orbitX = Math.cos(body.userData.angle) * body.userData.distance;
            const orbitZ = Math.sin(body.userData.angle) * body.userData.distance;
            
            // For bodies with epicycles, add additional motion
            if (body.userData.epicycleRadius > 0) {
                // Update epicycle angle (typically faster than orbit)
                body.userData.epicycleAngle += body.userData.epicycleSpeed * speed;
                
                // Calculate additional position from epicycle
                const epicycleX = Math.cos(body.userData.epicycleAngle) * body.userData.epicycleRadius;
                const epicycleZ = Math.sin(body.userData.epicycleAngle) * body.userData.epicycleRadius;
                
                // Combined position
                body.position.x = orbitX + epicycleX;
                body.position.z = orbitZ + epicycleZ;
                
                // Update epicycle circle position and rotation
                if (body.userData.epicycle) {
                    body.userData.epicycle.position.set(orbitX, 0, orbitZ);
                    body.userData.epicycle.rotation.z += 0.002 * speed; // Slight rotation for visual effect
                }
            } else {
                // Bodies without epicycles (like the Moon and Sun in this model)
                body.position.x = orbitX;
                body.position.z = orbitZ;
            }
            
            // Self rotation
            body.rotation.y += body.userData.rotationSpeed * speed;
        }
        // Earth stays at center but still rotates
        else if (body.userData.name === "Earth") {
            body.rotation.y += body.userData.rotationSpeed * speed;
        }
    });
}

function updateGeocentricScales(scaleMultiplier) {
    // Use the provided parameter or fall back to window value, with default of 0.2
    const scale = scaleMultiplier !== undefined ? scaleMultiplier : 
                 (window.scaleMultiplier !== undefined ? window.scaleMultiplier : 0.2);
    
    // Store the current scale value to window for other functions to access
    window.scaleMultiplier = scale;
    
    // Define different visual scales based on historical measures vs realism
    const visualScaleFactor = 0.5;
    
    // Get epicycle size from window or use default
    const epicycleScaleFactor = window.epicycleSize !== undefined ? window.epicycleSize : 0.5;
    
    celestialBodies.forEach(function(body) {
        const bodyName = body.userData.name;
        const originalData = originalGeoScales.find(b => b.name === bodyName);
        
        if (!originalData) return;
        
        // Size scaling with enhanced sun size for realism
        const baseSize = originalData.size;
        let sizeScale;
        
        if (bodyName === 'Sun') {
            // Dramatically increase sun size with scale realism
            // At max scale (1.0), make sun 75x larger than visual mode
            if (scale < 0.05) {
                // Pure visual mode - normal size
                sizeScale = baseSize;
            } else if (scale >= 0.95) {
                // True scale mode - 75x larger
                sizeScale = baseSize * 75;
            } else {
                // Progressive scaling using exponential curve for more dramatic growth
                const scaleFactor = Math.pow(scale, 2) * 75;
                sizeScale = baseSize * (1 + scaleFactor);
            }
            
            // Update sun glow size proportionally
            if (body.children && body.children.length > 0) {
                const possibleGlow = body.children.find(child => 
                    child.material && child.material.type === 'ShaderMaterial');
                
                if (possibleGlow) {
                    // Scale glow with sun, but slightly larger relative to sun at higher scales
                    const glowScaleFactor = 1.2 + scale * 0.3;
                    const baseGlowScale = sizeScale / baseSize;
                    possibleGlow.scale.set(
                        glowScaleFactor,
                        glowScaleFactor,
                        glowScaleFactor
                    );
                }
            }
        } else {
            // For planets, use similar scaling as before but make them slightly larger at high realism
            if (scale < 0.05) {
                // Pure visual mode
                sizeScale = baseSize;
            } else if (scale >= 0.95) {
                // True scale mode with minimum visibility threshold
                const minSizeThreshold = 1.5; // Slightly larger minimum size
                
                if (bodyName === 'Earth') {
                    sizeScale = baseSize * 1.5;
                } else {
                    // Base size with minimum threshold
                    sizeScale = Math.max(baseSize * 1.2, minSizeThreshold);
                }
            } else {
                // Blended mode with enhanced scaling
                const sigmoid = 1 / (1 + Math.exp(-12 * (scale - 0.5)));
                const visualComponent = baseSize * (1 - sigmoid);
                const realisticComponent = baseSize * (sigmoid) * 1.5; // Slightly larger
                sizeScale = visualComponent + realisticComponent;
            }
        }
        
        // Apply size scaling
        body.scale.set(sizeScale / baseSize, sizeScale / baseSize, sizeScale / baseSize);
        
        // Distance scaling for orbits with enhanced spacing
        if (!body.userData.isCenter) {
            // Find the orbit ring for this body
            const orbitIndex = Array.from(window.scene.children).findIndex(obj => 
                obj.type === 'Mesh' && 
                obj.geometry.type === 'RingGeometry' &&
                Math.abs(obj.geometry.parameters.innerRadius - (originalData.distance - 0.5)) < 0.1
            );
            
            if (orbitIndex !== -1) {
                let orbitDistance;
                
                // Calculate progressive spacing factor - more spacing as scale increases
                // Apply more spacing to outer planets
                const baseSpacingFactor = 1.0 + (scale * 4.0); // Up to 5x spacing at max scale
                let spacingFactor;
                
                // Calculate increasing spacing factor based on original distance
                if (originalData.distance <= 50) {
                    // Inner planets (Mercury) - lower spacing increase
                    spacingFactor = baseSpacingFactor * 1.0;
                } else if (originalData.distance <= 100) {
                    // Middle planets (Venus, Earth, Mars) - moderate spacing increase
                    spacingFactor = baseSpacingFactor * 1.5;
                } else if (originalData.distance <= 200) {
                    // Outer planets (Jupiter, Saturn) - higher spacing increase
                    spacingFactor = baseSpacingFactor * 2.0;
                } else {
                    // Most distant planets (Uranus, Neptune) - highest spacing increase
                    spacingFactor = baseSpacingFactor * 2.5;
                }
                
                // Use the enhanced spacing factor to modify orbit distances
                if (scale < 0.05) {
                    // Visual mode - base distances
                    orbitDistance = originalData.distance;
                } else if (scale >= 0.95) {
                    // True scale mode with dramatic spacing
                    orbitDistance = originalData.distance * spacingFactor;
                    
                    // Apply logarithmic scaling for better visualization of outer planets
                    if (orbitDistance > 300) {
                        const baseLog = Math.log(300);
                        orbitDistance = 300 + (Math.log(orbitDistance) - baseLog) * 200;
                    }
                } else {
                    // Blended mode with enhanced progressive spacing
                    const sigmoid = 1 / (1 + Math.exp(-12 * (scale - 0.5)));
                    const visualDistance = originalData.distance;
                    const realisticDistance = originalData.distance * spacingFactor;
                    
                    // Apply logarithmic compression to realisticDistance if it's very large
                    let adjustedRealisticDistance = realisticDistance;
                    if (realisticDistance > 300) {
                        const baseLog = Math.log(300);
                        adjustedRealisticDistance = 300 + (Math.log(realisticDistance) - baseLog) * 150;
                    }
                    
                    // Blend between visual and realistic distances
                    orbitDistance = visualDistance * (1 - sigmoid) + adjustedRealisticDistance * sigmoid;
                }
                
                // Update orbit ring with new distance
                const newOrbit = new THREE.RingGeometry(orbitDistance - 0.5, orbitDistance + 0.5, 128);
                window.scene.children[orbitIndex].geometry.dispose();
                window.scene.children[orbitIndex].geometry = newOrbit;
                
                // Update body's distance parameter
                body.userData.distance = orbitDistance;
                
                // Update epicycle size based on epicycleSize slider
                if (body.userData.epicycleRadius > 0) {
                    // Make epicycles proportionally larger with distance for better visibility
                    const epicycleSizeFactor = 1.0 + (scale * 2.0); // Increase epicycle size with scale
                    const baseEpicycleRadius = originalData.epicycleRadius * epicycleScaleFactor * epicycleSizeFactor;
                    body.userData.epicycleRadius = baseEpicycleRadius;
                    
                    // Find and update the epicycle ring
                    const epicycleIndex = Array.from(window.scene.children).findIndex(obj => 
                        obj === body.userData.epicycle
                    );
                    
                    if (epicycleIndex !== -1) {
                        const newEpicycle = new THREE.RingGeometry(
                            body.userData.epicycleRadius - 0.3, 
                            body.userData.epicycleRadius + 0.3, 
                            64
                        );
                        window.scene.children[epicycleIndex].geometry.dispose();
                        window.scene.children[epicycleIndex].geometry = newEpicycle;
                    }
                }
                
                // Update position immediately to match new distances
                const angle = body.userData.angle;
                const orbitX = Math.cos(angle) * orbitDistance;
                const orbitZ = Math.sin(angle) * orbitDistance;
                
                if (body.userData.epicycleRadius > 0) {
                    const epicycleX = Math.cos(body.userData.epicycleAngle) * body.userData.epicycleRadius;
                    const epicycleZ = Math.sin(body.userData.epicycleAngle) * body.userData.epicycleRadius;
                    
                    body.position.x = orbitX + epicycleX;
                    body.position.z = orbitZ + epicycleZ;
                    
                    if (body.userData.epicycle) {
                        body.userData.epicycle.position.set(orbitX, 0, orbitZ);
                    }
                } else {
                    body.position.x = orbitX;
                    body.position.z = orbitZ;
                }
            }
        }
    });
}

function updateEpicycles(epicycleSize) {
    // Ensure epicycle size is normalized between 0 and 1
    const normalizedSize = Math.max(0, Math.min(1, epicycleSize));
    
    // Store on window for access by other functions
    window.epicycleSize = normalizedSize;
    
    celestialBodies.forEach(function(body) {
        if (body.userData.epicycleRadius > 0) {
            const originalData = originalGeoScales.find(b => b.name === body.userData.name);
            if (!originalData) return;
            
            // Update epicycle size based on slider with consistent scaling
            const newRadius = originalData.epicycleRadius * normalizedSize;
            body.userData.epicycleRadius = newRadius;
            
            // Find and update the epicycle ring
            const epicycleIndex = Array.from(window.scene.children).findIndex(obj => 
                obj === body.userData.epicycle
            );
            
            if (epicycleIndex !== -1) {
                const newEpicycle = new THREE.RingGeometry(
                    newRadius - 0.3, 
                    newRadius + 0.3, 
                    64
                );
                window.scene.children[epicycleIndex].geometry.dispose();
                window.scene.children[epicycleIndex].geometry = newEpicycle;
            }
        }
    });
}

function resetGeocentricPositions() {
    celestialBodies.forEach(function(body) {
        const bodyName = body.userData.name;
        const originalPos = originalPositions[bodyName];
        
        if (originalPos) {
            body.userData.angle = originalPos.angle;
            body.userData.distance = originalPos.distance;
            
            if (body.userData.epicycleRadius > 0) {
                body.userData.epicycleAngle = originalPos.epicycleAngle;
                body.userData.epicycleRadius = originalPos.epicycleRadius;
                
                // Update epicycle visual
                if (body.userData.epicycle) {
                    const newEpicycle = new THREE.RingGeometry(
                        originalPos.epicycleRadius - 0.3, 
                        originalPos.epicycleRadius + 0.3, 
                        64
                    );
                    body.userData.epicycle.geometry.dispose();
                    body.userData.epicycle.geometry = newEpicycle;
                }
            }
            
            // Reset position
            if (body.userData.isCenter) {
                body.position.set(0, 0, 0);
            } else {
                const orbitX = Math.cos(originalPos.angle) * originalPos.distance;
                const orbitZ = Math.sin(originalPos.angle) * originalPos.distance;
                
                if (body.userData.epicycleRadius > 0) {
                    const epicycleX = Math.cos(body.userData.epicycleAngle) * body.userData.epicycleRadius;
                    const epicycleZ = Math.sin(body.userData.epicycleAngle) * body.userData.epicycleRadius;
                    
                    body.position.x = orbitX + epicycleX;
                    body.position.z = orbitZ + epicycleZ;
                    
                    if (body.userData.epicycle) {
                        body.userData.epicycle.position.set(orbitX, 0, orbitZ);
                    }
                } else {
                    body.position.x = orbitX;
                    body.position.z = orbitZ;
                }
            }
        }
    });
}

// Expose necessary functions to window
window.updateGeocentricPlanets = updateGeocentricPlanets;
window.updateGeocentricScales = updateGeocentricScales;
window.updateEpicycles = updateEpicycles;
window.resetGeocentricPositions = resetGeocentricPositions;

// Create the system when window loads
window.addEventListener('load', function() {
    createGeocentricSystem();
    
    // Apply initial scale if available
    setTimeout(function() {
        if (typeof window.updateGeocentricScales === 'function') {
            window.updateGeocentricScales(window.scaleMultiplier || 0.2);
        }
    }, 100);
});
