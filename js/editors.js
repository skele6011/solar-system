var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

// Create planet info panel
var planetInfoPanel = document.createElement('div');
planetInfoPanel.className = 'planet-info';
planetInfoPanel.style.display = 'none';
document.body.appendChild(planetInfoPanel);

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

// Add keyboard controls for movement
var keyboardControls = {
    moveSpeed: 2, // Reduced speed for smoother movement
    keys: {
        up: false,
        down: false,
        left: false,
        right: false,
        forward: false,
        backward: false
    }
};

window.addEventListener('keydown', function(event) {
    // Disable OrbitControls when arrow keys are used for movement
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
    }
});

window.addEventListener('keyup', function(event) {
    // Re-enable OrbitControls when arrow keys are released
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
    }
});

// Function to update camera position based on keyboard input
function updateCameraPosition() {
    if (!window.camera) return;
    
    // Simple movement along XZ plane for easier control
    if (keyboardControls.keys.up) {
        window.camera.position.z -= keyboardControls.moveSpeed;
    }
    if (keyboardControls.keys.down) {
        window.camera.position.z += keyboardControls.moveSpeed;
    }
    if (keyboardControls.keys.right) {
        window.camera.position.x += keyboardControls.moveSpeed;
    }
    if (keyboardControls.keys.left) {
        window.camera.position.x -= keyboardControls.moveSpeed;
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

// Make sure we set up our animation hook after everything is loaded
if (document.readyState === 'complete') {
    setupMovementInAnimationLoop();
} else {
    window.addEventListener('load', setupMovementInAnimationLoop);
}
