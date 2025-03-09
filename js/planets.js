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

        planet.userData = { distance: data.distance, angle: Math.random() * Math.PI * 2, speed: data.speed, name: data.name };
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
    });
}

function updatePlanets(speedMultiplier = 1) {
    planets.forEach(function(planet) {
        planet.userData.angle += planet.userData.speed * speedMultiplier;
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
    });
}
window.updatePlanets = updatePlanets;
window.addEventListener('load', createPlanets);
