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

// Add control panel
const controlPanel = document.createElement('div');
controlPanel.className = 'control-panel';
controlPanel.innerHTML = `
    <div class="dropdown-container">
        <label for="orbitalModel">Orbital Model</label>
        <select id="orbitalModel">
            <option value="geocentric">Geocentric Model (Historical)</option>
            <option value="heliocentric">Heliocentric Model (Modern)</option>
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
    <div class="slider-container">
        <label for="epicycleSize">Epicycle Size</label>
        <input type="range" id="epicycleSize" min="0" max="1" step="0.05" value="0.5">
        <span>Historical Accuracy →</span>
    </div>
`;
uiContainer.appendChild(controlPanel);

// Add model title at top
const modelTitle = document.createElement('div');
modelTitle.className = 'model-title';
modelTitle.textContent = "Geocentric Model (Ptolemaic System)";
document.body.appendChild(modelTitle);

// Add scale indicator
const scaleIndicator = document.createElement('div');
scaleIndicator.className = 'scale-indicator';
scaleIndicator.textContent = 'Scale: Visual Mode';
uiContainer.appendChild(scaleIndicator);

// Model indicator
const modelIndicator = document.createElement('div');
modelIndicator.className = 'model-indicator';
modelIndicator.textContent = 'Model: Geocentric (Historical)';
uiContainer.appendChild(modelIndicator);

// Create planet info panel
var planetInfoPanel = document.createElement('div');
planetInfoPanel.className = 'planet-info';
planetInfoPanel.style.display = 'none';
document.body.appendChild(planetInfoPanel);

// Create planet hover indicator
var hoverIndicator = document.createElement('div');
hoverIndicator.className = 'planet-hover-indicator';
document.body.appendChild(hoverIndicator);

// Event listeners for controls
document.getElementById('lightIntensity').addEventListener('input', function(e) {
    window.sunLight.intensity = parseFloat(e.target.value);
});

document.getElementById('animationSpeed').addEventListener('input', function(e) {
    const speed = parseFloat(e.target.value);
    // Ensure the speedMultiplier is updated in both the local window and the global window scope
    window.speedMultiplier = speed;
    
    // Add debug logging to verify the value is being set
    console.log("Animation speed updated to:", speed);
});

document.getElementById('scaleMultiplier').addEventListener('input', function(e) {
    const scale = parseFloat(e.target.value);
    // Update the global variable
    window.scaleMultiplier = scale;
    
    // Update the scale immediately and ensure proper values are passed
    if (typeof window.updateGeocentricScales === 'function') {
        window.updateGeocentricScales(scale);
    }
    
    // Update the scale indicator
    updateScaleIndicator(scale);
    
    // Add debug logging to verify the value is being set
    console.log("Scale multiplier updated to:", scale);
});

document.getElementById('epicycleSize').addEventListener('input', function(e) {
    const size = parseFloat(e.target.value);
    window.epicycleSize = size;
    
    if (typeof window.updateEpicycles === 'function') {
        window.updateEpicycles(size);
    }
    
    // Add debug logging
    console.log("Epicycle size updated to:", size);
});

// Event listener for ambient light
document.getElementById('ambientLight').addEventListener('input', function(e) {
    const value = parseFloat(e.target.value);
    window.scene.children.forEach(child => {
        if (child instanceof THREE.AmbientLight) {
            child.intensity = value;
        }
    });
});

// Event listener for scale mode - updated to match heliocentric behavior
document.getElementById('scaleMode').addEventListener('change', function(e) {
    let scaleValue;
    switch(e.target.value) {
        case 'visual':
            scaleValue = 0.1;
            document.getElementById('scaleMultiplier').value = scaleValue;
            window.camera.position.set(0, 120, 200);
            break;
        case 'mixed':
            scaleValue = 0.5;
            document.getElementById('scaleMultiplier').value = scaleValue;
            window.camera.position.set(0, 300, 600);
            break;
        case 'true':
            scaleValue = 1.0;
            document.getElementById('scaleMultiplier').value = scaleValue;
            window.camera.position.set(0, 500, 1000);
            break;
    }
    
    // Ensure reset of view to Earth at center
    if (window.controls) {
        window.controls.target.set(0, 0, 0);
        window.controls.update();
    }
    
    // Update global scale and apply changes
    window.scaleMultiplier = scaleValue;
    if (typeof window.updateGeocentricScales === 'function') {
        window.updateGeocentricScales(scaleValue);
    }
    updateScaleIndicator(scaleValue);
});

// Add event listener for the orbital model dropdown
document.getElementById('orbitalModel').addEventListener('change', function(e) {
    const newModel = e.target.value;
    
    // Redirect to appropriate page based on model
    if (newModel === 'heliocentric') {
        // Save any state if needed before redirecting
        localStorage.setItem('returnToScale', window.scaleMultiplier);
        
        // Redirect to heliocentric model (main page)
        window.location.href = '../index.html';
    } else {
        // Already on geocentric page, no need to redirect
        modelIndicator.textContent = 'Model: Geocentric (Historical)';
    }
});

// Update scale indicator function to match heliocentric behavior
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

// Reset simulation function
function resetSimulation() {
    console.log("Starting geocentric simulation reset...");
    
    // Reset camera
    window.camera.position.set(0, 150, 300);
    window.camera.lookAt(0, 0, 0);
    
    if (window.controls) {
        window.controls.target.set(0, 0, 0);
        window.controls.update();
    }
    
    // Reset to default scale - same as heliocentric
    const initialScale = 0.2;
    document.getElementById('scaleMultiplier').value = initialScale;
    document.getElementById('scaleMode').value = 'visual';
    window.scaleMultiplier = initialScale;
    updateScaleIndicator(initialScale);
    
    // Reset epicycle size
    document.getElementById('epicycleSize').value = 0.5;
    window.epicycleSize = 0.5;
    
    // Complete reset of planet positions
    if (typeof window.resetGeocentricPositions === 'function') {
        window.resetGeocentricPositions();
    }
    
    // Reset animation speed - same as heliocentric
    document.getElementById('animationSpeed').value = 1;
    window.speedMultiplier = 1;
    
    // Reset lighting - same as heliocentric
    document.getElementById('lightIntensity').value = 2.5;
    window.sunLight.intensity = 2.5;
    
    document.getElementById('ambientLight').value = 0.6;
    window.scene.children.forEach(child => {
        if (child instanceof THREE.AmbientLight) {
            child.intensity = 0.6;
        }
    });
    
    console.log("Geocentric simulation reset complete");
}

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

// Expose the reset function to window
window.resetSimulation = resetSimulation;
window.uiContainer = uiContainer;

// Planet selection and hover functionality
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

window.addEventListener('click', function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, window.camera);
    var intersects = raycaster.intersectObjects(window.scene.children, true);
    var intersected = intersects.find(function(i) {
        return i.object.userData && i.object.userData.name;
    });
    
    if (intersected) {
        const planetData = intersected.object.userData;
        showPlanetInfo(planetData);
    } else {
        // Hide panel when clicking empty space
        planetInfoPanel.style.display = 'none';
    }
});

// Track mouse movements for hover detection
window.addEventListener('mousemove', function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    if (window.camera) {
        raycaster.setFromCamera(mouse, window.camera);
        var intersects = raycaster.intersectObjects(window.scene.children, true);
        var intersected = intersects.find(function(i) {
            return i.object.userData && i.object.userData.name;
        });
        
        if (intersected) {
            const planetData = intersected.object.userData;
            hoverIndicator.textContent = planetData.name;
            hoverIndicator.style.left = event.clientX + 'px';
            hoverIndicator.style.top = event.clientY + 'px';
            hoverIndicator.classList.add('visible');
        } else {
            hoverIndicator.classList.remove('visible');
        }
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

// Add keyboard controls similar to the main view
var keyboardControls = {
    moveSpeed: 10,
    fastSpeed: 100,
    ultraSpeed: 1000,
    keys: {
        up: false,
        down: false,
        left: false,
        right: false,
        forward: false,
        backward: false,
        shift: false,
        alt: false
    }
};

window.addEventListener('keydown', function(event) {
    if (window.controls && 
        (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
         event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
         event.key === 'w' || event.key === 's' || 
         event.key === 'a' || event.key === 'd')) {
        window.controls.enabled = false;
    }

    switch(event.key) {
        case 'ArrowUp':
        case 'w':
            keyboardControls.keys.up = true;
            break;
        case 'ArrowDown':
        case 's':
            keyboardControls.keys.down = true;
            break;
        case 'ArrowLeft':
        case 'a':
            keyboardControls.keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            keyboardControls.keys.right = true;
            break;
        case 'Shift':
            keyboardControls.keys.shift = true;
            break;
        case 'Alt':
            keyboardControls.keys.alt = true;
            event.preventDefault();
            break;
    }
    
    if (event.key.toLowerCase() === 'r') {
        resetCameraTarget();
    }
});

window.addEventListener('keyup', function(event) {
    if (window.controls && 
        (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
         event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
         event.key === 'w' || event.key === 's' || 
         event.key === 'a' || event.key === 'd')) {
        window.controls.enabled = true;
    }

    switch(event.key) {
        case 'ArrowUp':
        case 'w':
            keyboardControls.keys.up = false;
            break;
        case 'ArrowDown':
        case 's':
            keyboardControls.keys.down = false;
            break;
        case 'ArrowLeft':
        case 'a':
            keyboardControls.keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
            keyboardControls.keys.right = false;
            break;
        case 'Shift':
            keyboardControls.keys.shift = false;
            break;
        case 'Alt':
            keyboardControls.keys.alt = false;
            break;
    }
});

function updateCameraPosition() {
    if (!window.camera) return;
    
    let currentSpeed;
    if (keyboardControls.keys.alt) {
        currentSpeed = keyboardControls.ultraSpeed;
    } else if (keyboardControls.keys.shift) {
        currentSpeed = keyboardControls.fastSpeed;
    } else {
        currentSpeed = keyboardControls.moveSpeed;
    }
    
    const scaleMultiplier = window.scaleMultiplier || 0.2;
    const distanceFactor = Math.max(1, Math.sqrt(
        window.camera.position.x * window.camera.position.x +
        window.camera.position.y * window.camera.position.y +
        window.camera.position.z * window.camera.position.z
    ) / 100);
    
    currentSpeed = currentSpeed * (1 + scaleMultiplier * 3) * (distanceFactor * 0.5);
    
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(window.camera.quaternion).normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(window.camera.quaternion).normalize();
    
    forward.y = 0;
    right.y = 0;
    
    if (forward.length() > 0) forward.normalize();
    if (right.length() > 0) right.normalize();
    
    const movement = new THREE.Vector3(0, 0, 0);
    
    if (keyboardControls.keys.up) {
        movement.add(forward.clone().multiplyScalar(currentSpeed));
    }
    if (keyboardControls.keys.down) {
        movement.add(forward.clone().multiplyScalar(-currentSpeed));
    }
    if (keyboardControls.keys.right) {
        movement.add(right.clone().multiplyScalar(currentSpeed));
    }
    if (keyboardControls.keys.left) {
        movement.add(right.clone().multiplyScalar(-currentSpeed));
    }
    
    window.camera.position.add(movement);
}

function resetCameraTarget() {
    if (window.controls) {
        window.controls.target.set(0, 0, 0);
        window.controls.update();
    }
}

// Add help text
function addHelpText() {
    const helpTextElement = document.createElement('div');
    helpTextElement.className = 'help-text';
    helpTextElement.innerHTML = `
        <p><strong>Geocentric Model (Ptolemaic System)</strong></p>
        <p>This historical model places Earth at the center of the universe with celestial bodies orbiting around it.</p>
        <p><strong>Controls:</strong></p>
        <p>- Click on planets to view information</p>
        <p>- WASD or Arrow keys to move forward/backward/left/right</p>
        <p>- Hold Shift for faster movement</p>
        <p>- Hold Alt for ultra-fast movement</p>
        <p>- Press R to reset view to Earth</p>
        <p>- Mouse drag to rotate view</p>
        <p>- Adjust epicycle size slider to see how Ptolemy explained retrograde motion</p>
        <p><em>Click this box to dismiss</em></p>
    `;
    document.body.appendChild(helpTextElement);
    
    helpTextElement.addEventListener('click', function() {
        helpTextElement.style.display = 'none';
    });
    
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

// Setup improved camera controls
function setupImprovedCameraControls() {
    if (!window.controls) return;
    
    window.controls.enableDamping = true;
    window.controls.dampingFactor = 0.1;
    window.controls.zoomSpeed = 1.2;
    window.controls.autoRotate = false;
    window.controls.panSpeed = 1.0;
    
    const originalUpdate = window.controls.update;
    window.controls.update = function() {
        originalUpdate.call(window.controls);
        window.camera.up.set(0, 1, 0);
    };
}

// Directly override the animation loop to include camera movement
function setupMovementInAnimationLoop() {
    if (!window.animate) return;
    
    const originalAnimate = window.animate;
    window.animate = function() {
        updateCameraPosition();
        originalAnimate();
    };
}

// Initialize everything when page loads - consistent with heliocentric
window.addEventListener('load', function() {
    addHelpText();
    setupImprovedCameraControls();
    setupMovementInAnimationLoop();
    
    // Initial scale and speed setting with values matching heliocentric
    setTimeout(function() {
        const initialScale = 0.2;  // Same as heliocentric default
        const initialSpeed = 1.0;  // Same as heliocentric default
        
        // Set the input element values first
        document.getElementById('scaleMultiplier').value = initialScale;
        document.getElementById('scaleMode').value = 'visual';
        document.getElementById('animationSpeed').value = initialSpeed;
        document.getElementById('epicycleSize').value = 0.5;
        
        // Then set the window variables
        window.scaleMultiplier = initialScale;
        window.speedMultiplier = initialSpeed;
        window.epicycleSize = 0.5;
        
        // Apply the initial values to the scene
        if (typeof window.updateGeocentricScales === 'function') {
            window.updateGeocentricScales(initialScale);
        }
        
        if (typeof window.updateEpicycles === 'function') {
            window.updateEpicycles(0.5);
        }
        
        console.log("Initial setup complete. Scale:", initialScale, "Speed:", initialSpeed);
    }, 200);
});
