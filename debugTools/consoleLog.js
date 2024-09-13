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

    popup.addEventListener('mousedown', () => bringToFront(popup));
}

export async function start() {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.bottom = '10px';
    popup.style.right = '10px';
    popup.style.width = '400px';
    popup.style.height = '300px';
    popup.style.backgroundColor = '#2c3e50';
    popup.style.borderRadius = '10px';
    popup.style.border = '2px solid #34495e';
    popup.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    popup.style.zIndex = '100000000000';
    popup.style.resize = 'both';
    popup.style.overflow = 'auto';

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
    title.innerText = 'Debug Console';
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
            popup.style.width = '400px';
            popup.style.height = '300px';
            popup.style.bottom = '10px';
            popup.style.right = '10px';
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

    const contentArea = document.createElement('div');
    contentArea.id = 'debug-content';
    contentArea.style.padding = '15px';
    contentArea.style.backgroundColor = '#ecf0f1';
    contentArea.style.borderBottomLeftRadius = '10px';
    contentArea.style.borderBottomRightRadius = '10px';
    popup.appendChild(contentArea);

    console._log = console.log;
    console.log = function (...args) {
        const message = args.join(' ');
        const logEntry = document.createElement('div');
        logEntry.innerText = message;
        contentArea.appendChild(logEntry);
        console._log.apply(console, args);
    };

    makePopupInteractive(popup, header);

    document.body.appendChild(popup);
}