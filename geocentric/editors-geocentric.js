// Create UI panel with the same style as the heliocentric model
function createUI() {
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

    // Add slider controls - optimized for realistic model
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
            <label for="viewPreset">View Preset</label>
            <select id="viewPreset">
                <option value="full">Full System View</option>
                <option value="inner">Inner Planets</option>
                <option value="earth">Earth-Moon System</option>
                <option value="outer">Outer Planets</option>
            </select>
        </div>
        <div class="slider-container">
            <label for="lightIntensity">Sun Light Intensity</label>
            <input type="range" id="lightIntensity" min="0" max="5" step="0.1" value="1.5">
        </div>
        <div class="slider-container">
            <label for="ambientLight">Ambient Light</label>
            <input type="range" id="ambientLight" min="0" max="2" step="0.1" value="0.6">
        </div>
        <div class="slider-container">
            <label for="animationSpeed">Animation Speed</label>
            <input type="range" id="animationSpeed" min="0" max="2" step="0.1" value="1">
        </div>
    `;
    uiContainer.appendChild(controlPanel);

    // Add model indicator
    const modelIndicator = document.createElement('div');
    modelIndicator.className = 'scale-indicator';
    modelIndicator.style.bottom = '50px';
    modelIndicator.textContent = 'Model: Geocentric (Historical)';
    uiContainer.appendChild(modelIndicator);

    // Add scale indicator
    const scaleIndicator = document.createElement('div');
    scaleIndicator.className = 'scale-indicator';
    scaleIndicator.textContent = 'True Historical Scale';
    uiContainer.appendChild(scaleIndicator);

    // Add current view indicator
    const viewIndicator = document.createElement('div');
    viewIndicator.className = 'scale-indicator';
    viewIndicator.style.bottom = '80px';
    viewIndicator.textContent = 'View: Full System';
    uiContainer.appendChild(viewIndicator);

    // Initialize variables
    let speedMultiplier = 1;
    window.currentSpeedFactor = speedMultiplier;

    // Set camera position for initial realistic view
    camera.position.set(0, 1500, 3000);
    controls.target.set(0, 0, 0);
    controls.update();

    // Add event listeners for sliders
    document.getElementById('lightIntensity').addEventListener('input', function(e) {
        const value = parseFloat(e.target.value);
        if (sunLight) {
            sunLight.intensity = value;
        }
    });

    document.getElementById('animationSpeed').addEventListener('input', function(e) {
        speedMultiplier = parseFloat(e.target.value);
        window.currentSpeedFactor = speedMultiplier;
    });

    document.getElementById('ambientLight').addEventListener('input', function(e) {
        const value = parseFloat(e.target.value);
        scene.children.forEach(child => {
            if (child instanceof THREE.AmbientLight) {
                child.intensity = value;
            }
        });
    });

    // Add event listener for view preset dropdown
    document.getElementById('viewPreset').addEventListener('change', function(e) {
        const view = e.target.value;
        switch(view) {
            case 'full':
                camera.position.set(0, 1500, 3000);
                viewIndicator.textContent = 'View: Full System';
                break;
            case 'inner':
                camera.position.set(0, 500, 1000);
                viewIndicator.textContent = 'View: Inner Planets';
                break;
            case 'earth':
                camera.position.set(0, 50, 100);
                viewIndicator.textContent = 'View: Earth-Moon System';
                break;
            case 'outer':
                camera.position.set(0, 2500, 5000);
                viewIndicator.textContent = 'View: Outer Planets';
                break;
        }
        
        // Reset target to origin
        controls.target.set(0, 0, 0);
        controls.update();
    });

    // Add event listener for the orbital model dropdown
    document.getElementById('orbitalModel').addEventListener('change', function(e) {
        if (e.target.value === 'heliocentric') {
            // Redirect to heliocentric model
            window.location.href = '../index.html';
        }
    });

    // Add refresh functionality
    refreshButton.addEventListener('click', function() {
        // Add a rotation animation while refreshing
        refreshButton.style.transition = 'transform 0.5s ease';
        refreshButton.style.transform = 'rotate(360deg)';
        
        setTimeout(() => {
            // Reset rotation after animation completes
            refreshButton.style.transition = 'none';
            refreshButton.style.transform = 'rotate(0deg)';
            
            // Reset the simulation
            resetGeocentricSimulation();
        }, 500);
    });
}

// Function to update planet scales based on the scale multiplier
function updateGeocentricScales(scaleMultiplier) {
    // Always use realistic scale
    Object.keys(planets).forEach(name => {
        if (planets[name]) {
            const planet = planetData[name];
            
            // Calculate scale factor for realistic appearance
            let scaleFactor;
            if (name === 'sun') {
                scaleFactor = 1.5; // Make the sun slightly larger for visibility
            } else if (name === 'jupiter' || name === 'saturn') {
                scaleFactor = 1.0; // Gas giants at proper scale
            } else {
                scaleFactor = 0.8; // Smaller planets slightly reduced
            }
            
            planets[name].scale.set(scaleFactor, scaleFactor, scaleFactor);
            
            // Calculate orbit distance for realistic appearance
            if (name !== 'earth' && planet.orbitRadius) {
                // Use a constant scale for all orbits that keeps things in view but maintains proportions
                const orbitScale = 0.5;
                
                // Update orbit visual - reconstruct orbit geometry
                if (orbits[name]) {
                    const orbitRadius = planet.orbitRadius * orbitScale;
                    const newOrbitGeometry = new THREE.RingGeometry(
                        orbitRadius - 0.1, 
                        orbitRadius + 0.1, 
                        64
                    );
                    
                    // Replace old geometry with new
                    orbits[name].geometry.dispose();
                    orbits[name].geometry = newOrbitGeometry;
                }
            }
        }
    });
}

// Function to reset the geocentric simulation
function resetGeocentricSimulation() {
    console.log("Starting geocentric simulation reset...");
    
    // Reset camera position for full system view
    camera.position.set(0, 1500, 3000);
    camera.lookAt(0, 0, 0);
    
    // Reset orbit controls
    controls.target.set(0, 0, 0);
    controls.update();
    
    // Reset dropdown selection
    document.getElementById('viewPreset').value = 'full';
    
    // Reset angles to create visually pleasing distribution
    let angleOffset = 0;
    Object.keys(angles).forEach(name => {
        angles[name] = (2 * Math.PI * angleOffset) / 
                       (Object.keys(planetData).length - 1);
        angleOffset++;
    });
    
    // Reset animation speed
    document.getElementById('animationSpeed').value = 1;
    window.currentSpeedFactor = 1;
    
    // Reset planet speeds to original values
    Object.keys(planetData).forEach(name => {
        if (name === 'earth') return;
        
        switch(name) {
            case 'moon': planetData[name].orbitSpeed = 0.015; break;
            case 'sun': planetData[name].orbitSpeed = 0.0025; break;
            case 'mercury': planetData[name].orbitSpeed = 0.004; break;
            case 'venus': planetData[name].orbitSpeed = 0.003; break;
            case 'mars': planetData[name].orbitSpeed = 0.002; break;
            case 'jupiter': planetData[name].orbitSpeed = 0.001; break;
            case 'saturn': planetData[name].orbitSpeed = 0.0006; break;
            case 'uranus': planetData[name].orbitSpeed = 0.0004; break;
            case 'neptune': planetData[name].orbitSpeed = 0.0002; break;
        }
    });
    
    // Reset lighting
    document.getElementById('lightIntensity').value = 1.5;
    if (sunLight) {
        sunLight.intensity = 1.5;
    }
    
    document.getElementById('ambientLight').value = 0.6;
    scene.children.forEach(child => {
        if (child instanceof THREE.AmbientLight) {
            child.intensity = 0.6;
        }
    });
    
    console.log("Geocentric simulation reset complete");
}

// Add planet info functionality matching heliocentric model
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Create planet info panel
const planetInfoPanel = document.createElement('div');
planetInfoPanel.className = 'planet-info';
planetInfoPanel.style.display = 'none';
document.body.appendChild(planetInfoPanel);

// Create planet hover indicator
const hoverIndicator = document.createElement('div');
hoverIndicator.className = 'planet-hover-indicator';
document.body.appendChild(hoverIndicator);

window.addEventListener('click', function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const planetMeshes = Object.values(planets);
    const intersects = raycaster.intersectObjects(planetMeshes);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        const planetName = Object.keys(planets).find(name => planets[name] === object);
        
        if (planetName) {
            const planet = planetData[planetName];
            showPlanetInfo({
                name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
                description: `In the geocentric model, ${planetName === 'sun' ? 'the Sun' : planetName} orbits around Earth at a distance of ${planet.orbitRadius} million kilometers.`,
                diameter: `Radius in model: ${planet.radius} units`,
                orbitalPeriod: planetName === 'earth' ? 'Center of the system' : 'Orbits Earth',
                dayLength: planetName === 'earth' ? '24 hours' : 'Varies'
            });
        }
    } else {
        // Hide panel when clicking empty space
        planetInfoPanel.style.display = 'none';
    }
});

// Track mouse movements for hover detection
window.addEventListener('mousemove', function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const planetMeshes = Object.values(planets);
    const intersects = raycaster.intersectObjects(planetMeshes);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        const planetName = Object.keys(planets).find(name => planets[name] === object);
        
        if (planetName) {
            hoverIndicator.textContent = planetName.charAt(0).toUpperCase() + planetName.slice(1);
            hoverIndicator.style.left = event.clientX + 'px';
            hoverIndicator.style.top = event.clientY + 'px';
            hoverIndicator.classList.add('visible');
        }
    } else {
        hoverIndicator.classList.remove('visible');
    }
});

function showPlanetInfo(planetData) {
    // Build HTML content for the panel
    planetInfoPanel.innerHTML = `
        <button class="planet-info-close">&times;</button>
        <h2>${planetData.name}</h2>
        <p>${planetData.description || 'No description available.'}</p>
        <p><strong>Diameter:</strong> ${planetData.diameter || 'Unknown'}</p>
        <p><strong>Orbital Period:</strong> ${planetData.orbitalPeriod || 'Unknown'}</p>
        <p><strong>Day Length:</strong> ${planetData.dayLength || 'Unknown'}</p>
    `;
    
    // Show the panel
    planetInfoPanel.style.display = 'block';
    
    // Add close button event listener
    const closeButton = planetInfoPanel.querySelector('.planet-info-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            planetInfoPanel.style.display = 'none';
        });
    }
}

// Add help text with updated instructions for the realistic model
function addHelpText() {
    const helpTextElement = document.createElement('div');
    helpTextElement.className = 'help-text';
    helpTextElement.innerHTML = `
        <p><strong>Geocentric Model - Historical View</strong></p>
        <p>This model shows the solar system as historically understood with Earth at center</p>
        <p><strong>Controls:</strong></p>
        <p>- Click on celestial bodies to view information</p>
        <p>- Use mouse to rotate view</p>
        <p>- Mouse wheel to zoom in/out</p>
        <p>- Use view presets to see different parts of the system</p>
        <p>- Adjust animation speed to control orbital motion</p>
        <p>- Earth remains fixed at the center</p>
        <p>- All celestial bodies orbit Earth</p>
        <p><em>Click this box to dismiss</em></p>
    `;
    document.body.appendChild(helpTextElement);
    
    // Make it dismissable
    helpTextElement.addEventListener('click', function() {
        helpTextElement.style.display = 'none';
    });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (helpTextElement.parentNode) {
            helpTextElement.style.opacity = '0';
            setTimeout(() => {
                if (helpTextElement.parentNode) {
                    helpTextElement.style.display = 'none';
                }
            }, 1000);
        }
    }, 10000);
}

// Add keyboard controls for easier navigation
window.addEventListener('keydown', function(event) {
    switch(event.key) {
        case '1': // Full system view
            document.getElementById('viewPreset').value = 'full';
            camera.position.set(0, 1500, 3000);
            controls.target.set(0, 0, 0);
            controls.update();
            break;
        case '2': // Inner planets view
            document.getElementById('viewPreset').value = 'inner';
            camera.position.set(0, 500, 1000);
            controls.target.set(0, 0, 0);
            controls.update();
            break;
        case '3': // Earth-Moon view
            document.getElementById('viewPreset').value = 'earth';
            camera.position.set(0, 50, 100);
            controls.target.set(0, 0, 0);
            controls.update();
            break;
        case '4': // Outer planets view
            document.getElementById('viewPreset').value = 'outer';
            camera.position.set(0, 2500, 5000);
            controls.target.set(0, 0, 0);
            controls.update();
            break;
        case 'r': // Reset
            resetGeocentricSimulation();
            break;
    }
});

// Initialize
createUI();
addHelpText();
