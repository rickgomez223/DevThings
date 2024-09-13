import { start as startConsoleLog } from './consoleLog.js'; // Adjust the path if necessary
import { startFBDB } from './firebaseDatabase.js';

export async function initializeToolbox() {
    // Create the popup window container
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.left = '20px';
    popup.style.width = '300px';
    popup.style.height = '200px';
    popup.style.backgroundColor = '#f1f1f1';
    popup.style.border = '1px solid #ccc';
    popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    popup.style.zIndex = '1000';
    popup.style.resize = 'both';
    popup.style.overflow = 'hidden';

    // Create the header
    const header = document.createElement('div');
    header.style.backgroundColor = '#333';
    header.style.color = '#fff';
    header.style.padding = '10px';
    header.style.cursor = 'move';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    // Header title
    const title = document.createElement('span');
    title.innerText = 'Toolbox';
    header.appendChild(title);

    // Fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerText = '[\u2b1c]';
    fullscreenBtn.style.marginLeft = 'auto';
    fullscreenBtn.style.backgroundColor = 'transparent';
    fullscreenBtn.style.border = 'none';
    fullscreenBtn.style.color = '#fff';
    fullscreenBtn.style.cursor = 'pointer';
    fullscreenBtn.onclick = () => {
        if (popup.style.width === '100%') {
            popup.style.width = '300px';
            popup.style.height = '200px';
            popup.style.top = '20px';
            popup.style.left = '20px';
        } else {
            popup.style.width = '100%';
            popup.style.height = '100%';
            popup.style.top = '0';
            popup.style.left = '0';
        }
    };
    header.appendChild(fullscreenBtn);

    // Minimize button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.innerText = '[ _ ]';
    minimizeBtn.style.backgroundColor = 'transparent';
    minimizeBtn.style.border = 'none';
    minimizeBtn.style.color = '#fff';
    minimizeBtn.style.cursor = 'pointer';
    minimizeBtn.onclick = () => {
        if (popup.style.height === '30px') {
            popup.style.height = '200px';
        } else {
            popup.style.height = '30px';
        }
    };
    header.appendChild(minimizeBtn);

    popup.appendChild(header);

    // Create the body
    const body = document.createElement('div');
    body.style.padding = '10px';
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    popup.appendChild(body);

    // Add buttons to run functions from other scripts
    const addButton = (name, action) => {
        const button = document.createElement('button');
        button.innerText = name;
        button.style.margin = '5px 0';
        button.style.padding = '5px';
        button.style.cursor = 'pointer';
        button.onclick = action;
        body.appendChild(button);
    };

    // Example button to start 'consoleLog.js'
    addButton('Console Log Tool', startConsoleLog);
    
    addButton('Firebase Database', startFBDB);

    // Make the window draggable
    let isDragging = false;
    let offsetX, offsetY;

    const startDrag = (e) => {
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e; // Handle both touch and mouse events
        offsetX = touch.clientX - popup.offsetLeft;
        offsetY = touch.clientY - popup.offsetTop;
    };

    const doDrag = (e) => {
        if (isDragging) {
            const touch = e.touches ? e.touches[0] : e;
            popup.style.left = `${touch.clientX - offsetX}px`;
            popup.style.top = `${touch.clientY - offsetY}px`;
        }
    };

    const stopDrag = () => {
        isDragging = false;
    };

    // Attach touch events for dragging
    header.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', doDrag);
    document.addEventListener('touchend', stopDrag);

    // Also attach mouse events for dragging
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);

    // Append the popup to the document
    document.body.appendChild(popup);
}

// Run the initialization function on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeToolbox);