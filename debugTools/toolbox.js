import { start as startConsoleLog } from './consoleLog.js'; // Adjust the path if necessary
import { startFBDB } from './firebaseDatabase.js';

export async function initializeToolbox() {
    // Create the popup window container
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50px';
    popup.style.left = '50px';
    popup.style.width = '350px';
    popup.style.height = '300px';
    popup.style.backgroundColor = '#2c3e50';
    popup.style.borderRadius = '10px';
    popup.style.border = '2px solid #34495e';
    popup.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    popup.style.zIndex = '100000000000';
    popup.style.resize = 'both';
    popup.style.overflow = 'hidden';

    // Create the header
    const header = document.createElement('div');
    header.style.backgroundColor = '#34495e';
    header.style.color = '#ecf0f1';
    header.style.padding = '10px';
    header.style.cursor = 'move';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.borderTopLeftRadius = '8px';
    header.style.borderTopRightRadius = '8px';

    // Header title
    const title = document.createElement('span');
    title.innerText = 'Toolbox';
    title.style.fontWeight = 'bold';
    header.appendChild(title);

    // Fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerText = '[\u2b1c]';
    fullscreenBtn.style.marginLeft = 'auto';
    fullscreenBtn.style.backgroundColor = 'transparent';
    fullscreenBtn.style.border = 'none';
    fullscreenBtn.style.color = '#ecf0f1';
    fullscreenBtn.style.fontSize = '16px';
    fullscreenBtn.style.cursor = 'pointer';
    fullscreenBtn.onclick = () => {
        if (popup.style.width === '100%') {
            popup.style.width = '350px';
            popup.style.height = '300px';
            popup.style.top = '50px';
            popup.style.left = '50px';
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
    minimizeBtn.style.color = '#ecf0f1';
    minimizeBtn.style.fontSize = '16px';
    minimizeBtn.style.cursor = 'pointer';
    minimizeBtn.onclick = () => {
        if (popup.style.height === '40px') {
            popup.style.height = '300px';
        } else {
            popup.style.height = '40px';
        }
    };
    header.appendChild(minimizeBtn);

    popup.appendChild(header);

    // Create the body
    const body = document.createElement('div');
    body.style.padding = '15px';
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '10px';
    body.style.backgroundColor = '#ecf0f1';
    body.style.borderBottomLeftRadius = '8px';
    body.style.borderBottomRightRadius = '8px';
    popup.appendChild(body);

    // Add buttons to run functions from other scripts
    const addButton = (name, action) => {
        const button = document.createElement('button');
        button.innerText = name;
        button.style.margin = '5px 0';
        button.style.padding = '10px';
        button.style.fontSize = '14px';
        button.style.color = '#ecf0f1';
        button.style.backgroundColor = '#2980b9';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.3s ease';

        button.onmouseover = () => {
            button.style.backgroundColor = '#3498db';
        };

        button.onmouseout = () => {
            button.style.backgroundColor = '#2980b9';
        };

        button.onclick = action;
        body.appendChild(button);
    };

    // Add your buttons here
    addButton('Console Log Tool', startConsoleLog);
    addButton('Firebase Database', startFBDB);

    // Make the window draggable
    let isDragging = false;
    let offsetX, offsetY;

    const startDrag = (e) => {
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
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