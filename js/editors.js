var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

// Create planet info panel
var planetInfoPanel = document.createElement('div');
planetInfoPanel.className = 'planet-info';
planetInfoPanel.style.display = 'none';
document.body.appendChild(planetInfoPanel);

// Create planet hover indicator
var hoverIndicator = document.createElement('div');
hoverIndicator.className = 'planet-hover-indicator';
document.body.appendChild(hoverIndicator);

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

// Update movement speeds for the larger scale
var keyboardControls = {
    moveSpeed: 10, // Base speed increased for larger scale
    fastSpeed: 100, // Fast speed for traversing the system quickly
    ultraSpeed: 1000, // Ultra-fast speed for true scale navigation
    keys: {
        up: false,
        down: false,
        left: false,
        right: false,
        forward: false,
        backward: false,
        shift: false, // For faster movement
        alt: false    // For ultra-fast movement
    }
};

window.addEventListener('keydown', function(event) {
    // Disable OrbitControls when movement keys are used
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
            event.preventDefault(); // Prevent browser menu from appearing
            break;
    }
    
    if (event.key.toLowerCase() === 'r') {
        resetCameraTarget();
    }
});

window.addEventListener('keyup', function(event) {
    // Re-enable OrbitControls when keys are released
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

// Function to update camera position with adaptive speed
function updateCameraPosition() {
    if (!window.camera) return;
    
    // Determine current speed based on modifier keys
    let currentSpeed;
    if (keyboardControls.keys.alt) {
        currentSpeed = keyboardControls.ultraSpeed;
    } else if (keyboardControls.keys.shift) {
        currentSpeed = keyboardControls.fastSpeed;
    } else {
        currentSpeed = keyboardControls.moveSpeed;
    }
    
    // Scale speed based on scale multiplier and camera distance
    const scaleMultiplier = window.scaleMultiplier || 0.2;
    const distanceFactor = Math.max(1, Math.sqrt(
        window.camera.position.x * window.camera.position.x +
        window.camera.position.y * window.camera.position.y +
        window.camera.position.z * window.camera.position.z
    ) / 100);
    
    // Adjust speed based on scale and distance
    currentSpeed = currentSpeed * (1 + scaleMultiplier * 3) * (distanceFactor * 0.5);
    
    // Get camera's current orientation
    // Create movement vectors based on camera's orientation
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(window.camera.quaternion).normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(window.camera.quaternion).normalize();
    
    // Prevent vertical movement by zeroing out the y component
    forward.y = 0;
    right.y = 0;
    
    // Re-normalize after zeroing y component to maintain consistent speed
    if (forward.length() > 0) forward.normalize();
    if (right.length() > 0) right.normalize();
    
    // Movement vector
    const movement = new THREE.Vector3(0, 0, 0);
    
    // Apply movement based on keys pressed
    if (keyboardControls.keys.up) {
        movement.add(forward.multiplyScalar(currentSpeed));
    }
    if (keyboardControls.keys.down) {
        movement.add(forward.clone().multiplyScalar(-currentSpeed));
    }
    if (keyboardControls.keys.right) {
        movement.add(right.multiplyScalar(currentSpeed));
    }
    if (keyboardControls.keys.left) {
        movement.add(right.clone().multiplyScalar(-currentSpeed));
    }
    
    // Apply movement to camera position
    window.camera.position.add(movement);
}

// Add orbit center reset function
function resetCameraTarget() {
    if (window.controls) {
        window.controls.target.set(0, 0, 0);
        window.controls.update();
    }
}

// Directly override the animation loop
function setupMovementInAnimationLoop() {
    if (!window.animate) return;
    
    const originalAnimate = window.animate;
    window.animate = function() {
        updateCameraPosition();
        originalAnimate();
    };
}

// Add a function to set up a better camera control system
function setupImprovedCameraControls() {
    if (!window.controls) return;
    
    // Better damping for smoother camera movement
    window.controls.enableDamping = true;
    window.controls.dampingFactor = 0.1;
    
    // Improve zoom speed based on distance
    window.controls.zoomSpeed = 1.2;
    
    // Allow the user to rotate the camera when needed
    window.controls.autoRotate = false;
    window.controls.autoRotateSpeed = 0.5;
    
    // Setup pan speed
    window.controls.panSpeed = 1.0;
    
    // Update the orbit controls to have a more natural feel
    const originalUpdate = window.controls.update;
    window.controls.update = function() {
        originalUpdate.call(window.controls);
        
        // Maintain a reasonable up direction
        window.camera.up.set(0, 1, 0);
    };
}

// Add help text with instructions for true scale navigation
function addHelpText() {
    const helpTextElement = document.createElement('div');
    helpTextElement.className = 'help-text';
    helpTextElement.innerHTML = `
        <p><strong>Solar System Scale: 1 unit = 1,000,000 km</strong></p>
        <p><strong>Controls:</strong></p>
        <p>- Click on planets to view information</p>
        <p>- WASD or Arrow keys to move forward/backward/left/right</p>
        <p>- Hold Shift for faster movement</p>
        <p>- Hold Alt for ultra-fast movement (for true scale)</p>
        <p>- Press R to reset view to center of solar system</p>
        <p>- Mouse drag to rotate view</p>
        <p>- Mouse wheel to zoom in/out</p>
        <p>- Choose a view mode or use the slider</p>
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

// Add a visual indicator for movement direction
function createDirectionIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'direction-indicator';
    indicator.style.display = 'none';
    document.body.appendChild(indicator);
    
    window.addEventListener('keydown', function(event) {
        // Show indicator when movement keys are pressed
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
            event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
            event.key === 'w' || event.key === 's' || 
            event.key === 'a' || event.key === 'd') {
            
            indicator.style.display = 'block';
            setTimeout(() => { 
                indicator.style.display = 'none'; 
            }, 1000);
        }
    });
    
    return indicator;
}

// Call it after the page loads
window.addEventListener('load', function() {
    addHelpText();
    setupMovementInAnimationLoop();
    setupImprovedCameraControls();
    createDirectionIndicator();
});

// Add zoom controls for easier navigation
window.addEventListener('wheel', function(event) {
    if (window.camera && window.controls) {
        // If Orbit controls are enabled, don't interfere with their zoom
        if (window.controls.enabled) return;
        
        // Dynamic zoom speed based on distance from center
        const distanceFromOrigin = Math.sqrt(
            window.camera.position.x * window.camera.position.x + 
            window.camera.position.z * window.camera.position.z
        );
        
        // Zoom faster when further away
        const zoomFactor = 0.05 + (distanceFromOrigin / 1000);
        const zoomSpeed = Math.abs(event.deltaY) * zoomFactor;
        
        if (event.deltaY > 0) {
            // Zoom out
            window.camera.position.z += zoomSpeed;
        } else {
            // Zoom in - prevent zooming through objects
            if (window.camera.position.z > 20) {
                window.camera.position.z -= zoomSpeed;
            }
        }
    }
});

// Make sure we set up our animation hook after everything is loaded
if (document.readyState === 'complete') {
    setupMovementInAnimationLoop();
} else {
    window.addEventListener('load', setupMovementInAnimationLoop);
}
