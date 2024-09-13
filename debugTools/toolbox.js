import { start as startConsoleLog } from './consoleLog.js';
import { startFBDB } from './firebaseDatabase.js';

// Utility to bring a popup to the front
function bringToFront(popup) {
    const highestZIndex = Math.max(
        ...Array.from(document.querySelectorAll('div[style*="z-index"]')).map(
            (el) => parseInt(el.style.zIndex) || 0
        )
    );
    popup.style.zIndex = highestZIndex + 1;
}

// Base function to handle draggable popups
function makePopupInteractive(popup, header) {
    let isDragging = false;
    let offsetX, offsetY;

    const startDrag = (e) => {
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        offsetX = touch.clientX - popup.offsetLeft;
        offsetY = touch.clientY - popup.offsetTop;
        bringToFront(popup);
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

    header.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', doDrag);
    document.addEventListener('touchend', stopDrag);

    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);

    // Bring the popup to the front on any click
    popup.addEventListener('mousedown', () => bringToFront(popup));
}

// Initialize the Toolbox
export async function initializeToolbox() {
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

    const header = document.createElement('div');
    header.style.backgroundColor = '#34495e';
    header.style.color = '#ecf0f1';
    header.style.padding = '10px';
    header.style.cursor = 'move';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.borderTopLeftRadius = '10px';
    header.style.borderTopRightRadius = '10px';

    const title = document.createElement('span');
    title.innerText = 'Toolbox';
    title.style.fontWeight = 'bold';
    header.appendChild(title);

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

    const closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = '#e74c3c';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
        popup.remove();
    };
    header.appendChild(closeButton);

    popup.appendChild(header);

    const body = document.createElement('div');
    body.style.padding = '15px';
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '10px';
    body.style.backgroundColor = '#ecf0f1';
    body.style.borderBottomLeftRadius = '10px';
    body.style.borderBottomRightRadius = '10px';
    popup.appendChild(body);

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

    addButton('Console Log Tool', startConsoleLog);
    addButton('Firebase Database', startFBDB);

    makePopupInteractive(popup, header);

    document.body.appendChild(popup);
}

document.addEventListener('DOMContentLoaded', initializeToolbox);